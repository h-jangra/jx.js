class JX {
  constructor() {
    this.templates = new Map();
  }

  init() {
    this.loadTemplates();
    this.bindEvents();
  }

  loadTemplates() {
    document.querySelectorAll('template[id]').forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[jx-get], [jx-post]');
      if (!el) return;
      e.preventDefault();
      this.handleTrigger(el);
    });
  }

  async handleTrigger(element) {
    const url = element.getAttribute('jx-get') || element.getAttribute('jx-post');
    const method = element.hasAttribute('jx-post') ? 'POST' : 'GET';

    const config = {
      url,
      method,
      target: element.getAttribute('jx-target'),
      template: element.getAttribute('jx-template')
    };

    await this.render(config);
  }

  async render({ url, method = 'GET', target, template: templateName }) {
    const targetEl = document.querySelector(target);
    const template = this.templates.get(templateName);

    if (!targetEl || !template) {
      console.error('JX: Missing target or template', { target, templateName });
      return;
    }

    targetEl.innerHTML = '<div class="jx-loading">Loading...</div>';

    try {
      const response = await fetch(url, { method });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.renderTemplate(targetEl, template, data);

    } catch (error) {
      targetEl.innerHTML = `<div class="jx-error">Error: ${error.message}</div>`;
    }
  }

  renderTemplate(target, template, data) {
    const fragment = template.content.cloneNode(true);
    this.interpolate(fragment, data);
    target.innerHTML = '';
    target.appendChild(fragment);
  }

  interpolate(node, data) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = this.replacePlaceholders(node.textContent, data);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      // Handle attributes
      Array.from(node.attributes).forEach(attr => {
        if (attr.value.includes('{{')) {
          node.setAttribute(attr.name, this.replacePlaceholders(attr.value, data));
        }
      });

      // Handle loops FIRST
      if (node.hasAttribute('jx-each')) {
        this.handleLoop(node, data);
        return;
      }

      // Handle conditionals
      if (node.hasAttribute('jx-if')) {
        if (!this.handleConditional(node, data)) {
          return;
        }
      }
    }

    // Process children
    if (node.childNodes) {
      Array.from(node.childNodes).forEach(child => {
        this.interpolate(child, data);
      });
    }
  }

  replacePlaceholders(text, data) {
    return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
      const value = this.get(data, path.trim());
      return value != null ? String(value) : '';
    });
  }

  handleLoop(node, data) {
    const path = node.getAttribute('jx-each');
    const array = this.get(data, path);

    if (!Array.isArray(array)) {
      node.remove();
      return;
    }

    const parent = node.parentNode;
    const template = node.cloneNode(true);
    template.removeAttribute('jx-each');

    const originalIndex = Array.from(parent.childNodes).indexOf(node);
    if (originalIndex !== -1) {
      parent.removeChild(node);
    }

    array.forEach((item, index) => {
      const clone = template.cloneNode(true);
      clone.setAttribute('data-index', index);
      this.interpolate(clone, item);
      parent.insertBefore(clone, parent.childNodes[originalIndex + index]);
    });
  }

  handleConditional(node, data) {
    const condition = node.getAttribute('jx-if');
    const value = this.get(data, condition);

    if (!value) {
      node.remove();
      return false;
    }

    node.removeAttribute('jx-if');
    return true;
  }

  get(obj, path) {
    if (path === '.' || path === 'this') return obj;
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  async load(url, { target, template, method = 'GET' }) {
    return this.render({ url, method, target, template });
  }

  bind(selector, config) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error('JX: Bind target not found:', selector);
      return;
    }

    element.setAttribute('jx-get', config.url || '');
    element.setAttribute('jx-target', config.target);
    element.setAttribute('jx-template', config.template);
    if (config.method === 'POST') {
      element.setAttribute('jx-post', config.url || '');
      element.removeAttribute('jx-get');
    }
  }
}

const jx = new JX();
jx.init();
export default jx;
