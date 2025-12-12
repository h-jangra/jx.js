class JX {
  constructor() {
    this.templates = new Map(
      [...document.querySelectorAll("template[id]")].map(t => [t.id, t])
    );

    document.addEventListener("click", e => {
      const el = e.target.closest("[jx-get],[jx-post]");
      if (el) {
        e.preventDefault();
        this.trigger(el);
      }
    });
  }

  async trigger(el) {
    const method = el.hasAttribute("jx-post") ? "POST" : "GET";
    const url = el.getAttribute(`jx-${method.toLowerCase()}`);

    await this.render({
      url,
      method,
      template: el.getAttribute("jx-template"),
      save: el.getAttribute("jx-save")
    });
  }

  async render({ url, method, template, save }) {
    const tpl = this.templates.get(template);
    if (!tpl) return;

    try {
      const res = await fetch(url, { method });
      if (!res.ok) throw Error(res.status);
      const data = await res.json();

      if (save) localStorage.setItem(save, JSON.stringify(data));

      this.renderTemplate(tpl, data);
    } catch (e) {
      this.renderError(tpl, e.message);
    }
  }

  renderTemplate(tpl, data) {
    const frag = tpl.content.cloneNode(true);
    this.walk(frag, data);
    tpl.replaceWith(frag);
  }

  renderError(tpl, msg) {
    const el = document.createElement("div");
    el.className = "jx-error";
    el.textContent = "Error: " + msg;
    tpl.replaceWith(el);
  }

  walk(node, data) {
    if (node.nodeType === 3) {
      node.textContent = node.textContent.replace(/\{\{([^}]+)\}\}/g,
        (_, p) => this.get(data, p.trim()) ?? ""
      );
      return;
    }

    if (node.nodeType !== 1) {
      node.childNodes.forEach(n => this.walk(n, data));
      return;
    }

    if (node.hasAttribute("jx-each")) {
      this.each(node, data);
      return;
    }

    if (node.hasAttribute("jx-if") && !this.get(data, node.getAttribute("jx-if"))) {
      node.remove();
      return;
    }

    [...node.attributes].forEach(a => {
      if (a.value.includes("{{")) {
        node.setAttribute(
          a.name,
          a.value.replace(/\{\{([^}]+)\}\}/g,
            (_, p) => this.get(data, p.trim()) ?? ""
          )
        );
      }
    });

    node.childNodes.forEach(n => this.walk(n, data));
  }

  each(node, data) {
    const arr = this.get(data, node.getAttribute("jx-each")) ?? data;
    if (!Array.isArray(arr)) { node.remove(); return; }

    const tpl = node.cloneNode(true);
    tpl.removeAttribute("jx-each");
    const parent = node.parentNode;
    const next = node.nextSibling;
    node.remove();

    arr.forEach(item => {
      const c = tpl.cloneNode(true);
      this.walk(c, item);
      next ? parent.insertBefore(c, next) : parent.appendChild(c);
    });
  }

  get(o, path) {
    if (path === "." || path === "this") return o;
    return path.split(".").reduce((x, k) => x?.[k], o);
  }

  static json(tpl, data) {
    const el = typeof tpl === "string" ? document.getElementById(tpl) : tpl;
    if (el) jx.renderTemplate(el, data);
  }

  static bind(selector, config) {
    const el = document.querySelector(selector);
    if (!el) return;

    if (config.data) {
      el.addEventListener("click", e => {
        e.preventDefault();
        const tpl = jx.templates.get(config.template);
        if (tpl) jx.renderTemplate(tpl, config.data);
      });
      return;
    }

    const m = config.method === "POST" ? "post" : "get";
    el.setAttribute(`jx-${m}`, config.url);
    el.setAttribute("jx-template", config.template);
    if (config.save) el.setAttribute("jx-save", config.save);
  }

  static loadCached(key, tpl) {
    const c = localStorage.getItem(key);
    if (!c) return false;
    JX.json(tpl, JSON.parse(c));
    return true;
  }

  static load(selector, cfg) {
    JX.bind(selector, cfg);
    jx.trigger(document.querySelector(selector));
  }
}

const jx = new JX();

