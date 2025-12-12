class JX {
  constructor() {
    this.templates = new Map();
    document.querySelectorAll('template[id]').forEach(t => {
      this.templates.set(t.id, t);
    });

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[jx-get], [jx-post]');
      if (el) {
        e.preventDefault();
        this.handleTrigger(el);
      }
    });
  }

  async handleTrigger(el) {
    const url = el.getAttribute('jx-get') || el.getAttribute('jx-post');
    const method = el.hasAttribute('jx-post') ? 'POST' : 'GET';

    await this.render({
      url,
      method,
      template: el.getAttribute('jx-template'),
      save: el.getAttribute('jx-save')
    });
  }

  async render(config) {
    const template = this.templates.get(config.template);
    if (!template) return;

    try {
      const response = await fetch(config.url, { method: config.method });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (config.save) {
        localStorage.setItem(config.save, JSON.stringify(data));
      }

      this.renderTemplate(template, data);
    } catch (error) {
      this.renderError(template, error.message);
    }
  }

  renderTemplate(template, data) {
    const fragment = template.content.cloneNode(true);
    this.interpolate(fragment, data);
    template.replaceWith(fragment);
  }

  renderError(template, message) {
    const error = document.createElement('div');
    error.className = 'jx-error';
    error.textContent = `Error: ${message}`;
    template.replaceWith(error);
  }

  interpolate(node, data) {
    if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('jx-each')) {
      this.handleLoop(node, data);
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = node.textContent.replace(/\{\{([^}]+)\}\}/g,
        (_, path) => this.get(data, path.trim()) ?? ''
      );
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.attributes).forEach(attr => {
        if (attr.value.includes('{{')) {
          node.setAttribute(attr.name,
            attr.value.replace(/\{\{([^}]+)\}\}/g,
              (_, path) => this.get(data, path.trim()) ?? ''
            )
          );
        }
      });

      if (node.hasAttribute('jx-if') && !this.get(data, node.getAttribute('jx-if'))) {
        node.remove();
        return;
      }
    }

    if (!node.hasAttribute?.('jx-each')) {
      node.childNodes?.forEach(child => this.interpolate(child, data));
    }
  }

  handleLoop(node, data) {
    const path = node.getAttribute('jx-each');
    const array = path === '.' ? data : this.get(data, path);

    if (!Array.isArray(array)) {
      console.warn('JX: jx-each data is not an array:', array);
      node.remove();
      return;
    }

    const parent = node.parentNode;
    const template = node.cloneNode(true);
    template.removeAttribute('jx-each');

    const nextSibling = node.nextSibling;
    node.remove();

    array.forEach(item => {
      const clone = template.cloneNode(true);
      this.interpolate(clone, item);
      if (nextSibling) {
        parent.insertBefore(clone, nextSibling);
      } else {
        parent.appendChild(clone);
      }
    });
  }

  get(obj, path) {
    if (path === '.' || path === 'this') return obj;
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  static json(template, data) {
    const templateEl = typeof template === 'string'
      ? document.getElementById(template)
      : template;

    if (!templateEl) {
      console.error('JX: Template not found');
      return;
    }

    jx.renderTemplate(templateEl, data);
  }

  static bind(selector, config) {
    const el = document.querySelector(selector);
    if (!el) return;

    el.setAttribute('jx-get', config.url);
    el.setAttribute('jx-template', config.template);

    if (config.save) {
      el.setAttribute('jx-save', config.save);
    }

    if (config.method === 'POST') {
      el.setAttribute('jx-post', config.url);
      el.removeAttribute('jx-get');
    }
  }

  static loadCached(key, template) {
    const cached = localStorage.getItem(key);
    if (cached) {
      JX.json(template, JSON.parse(cached));
      return true;
    }
    return false;
  }
}

const jx = new JX();
