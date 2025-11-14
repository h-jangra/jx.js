class JASON {
  constructor() {
    this.initAttributes();
  }

  // Initialize attribute-based bindings
  initAttributes() {
    document.querySelectorAll("[jx-get], [jx-post]").forEach(el => {
      const trigger = el.getAttribute("jx-trigger") || "click";
      el.addEventListener(trigger, () => this.handleRequest({
        element: el,
        get: el.getAttribute("jx-get"),
        post: el.getAttribute("jx-post"),
        target: el.getAttribute("jx-target"),
        template: el.getAttribute("jx-template")
      }));
    });
  }

  // Object-based binding
  bind(config) {
    const el = document.querySelector(config.element);
    const trigger = config.trigger || "click";
    el.addEventListener(trigger, () => this.handleRequest(config));
  }

  // Template rendering engine (loops, conditionals, variables)
  renderTemplate(templateEl, data) {
    let template = templateEl.innerHTML;

    const processTemplate = (tpl, ctx) => {
      // Loops: {{#items}}...{{/items}}
      tpl = tpl.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
        const arr = ctx[key];
        if (!Array.isArray(arr)) return '';
        return arr.map(item => processTemplate(inner, item)).join('');
      });

      // Conditionals: {{#if condition}}...{{/if}}
      tpl = tpl.replace(/\{\{#if (.*?)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, condition, inner) => {
        const value = condition.split('.').reduce((obj, k) => obj?.[k], ctx);
        return value ? processTemplate(inner, ctx) : '';
      });

      // Variables: {{key}}
      tpl = tpl.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        const value = key.trim().split('.').reduce((obj, k) => obj?.[k], ctx);
        return value !== undefined ? value : '';
      });

      return tpl;
    };

    return processTemplate(template, data);
  }

  // Handle API request and render
  async handleRequest(config) {
    const method = config.post ? "POST" : "GET";
    const url = config[method.toLowerCase()];
    const target = document.querySelector(config.target);
    const templateEl = config.template ? document.querySelector(config.template) : null;

    // Inline loading state
    target.innerHTML = `<div style="color:#555;font-style:italic;">Loading...</div>`;
    target.dispatchEvent(new CustomEvent("jx:loading", { detail: { url } }));

    try {
      const response = await fetch(url, { method });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (templateEl) {
        target.innerHTML = this.renderTemplate(templateEl, data);
      } else {
        target.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      }

      target.dispatchEvent(new CustomEvent("jx:success", { detail: { data } }));
    } catch (err) {
      target.innerHTML = `<div style="color:red;font-weight:bold;">Error: ${err.message}</div>`;
      target.dispatchEvent(new CustomEvent("jx:error", { detail: { error: err.message } }));
      console.error("JASON Error:", err);
    }
  }
}

export default new JASON();
