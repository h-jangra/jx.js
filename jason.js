class JASON {
  init() {
    document.querySelectorAll("[jx-get], [jx-post]").forEach(el => {
      const t = el.getAttribute("jx-trigger") || "click";
      el.addEventListener(t, () => this.handle({
        method: el.hasAttribute("jx-post") ? "POST" : "GET",
        url: el.getAttribute(el.hasAttribute("jx-post") ? "jx-post" : "jx-get"),
        target: el.getAttribute("jx-target"),
        template: el.getAttribute("jx-template")
      }));
    });
  }

  bind({ element, trigger = "click", method = "GET", url, target, template, immediate = false }) {
    const el = typeof element === "string" ? document.querySelector(element) : element;
    if (!el) return;
    const cfg = { method, url, target, template };
    const handler = () => this.handle(cfg);
    el.addEventListener(trigger, handler);
    if (immediate) this.handle(cfg);
    return () => el.removeEventListener(trigger, handler);
  }

  get(ctx, path) {
    if (!path || path === "." || path === "this") return ctx;
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), ctx);
  }

  interpolate(node, item) {
    if (node.nodeType === 1) {
      for (const a of Array.from(node.attributes)) {
        if (!a.value.includes("{{")) continue;
        node.setAttribute(a.name, a.value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, p) => {
          const key = p.trim();
          const v = (key === "." || key === "this") ? item : this.get(item, key);
          return v == null ? "" : String(v);
        }));
      }
    }
    if (node.nodeType === 3 && node.nodeValue.includes("{{")) {
      node.nodeValue = node.nodeValue.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, p) => {
        const key = p.trim();
        const v = (key === "." || key === "this") ? item : this.get(item, key);
        return v == null ? "" : String(v);
      });
    }
    node.childNodes && node.childNodes.forEach(n => this.interpolate(n, item));
  }

  renderFragment(tplEl, data) {
    const container = document.createElement("div");
    container.appendChild(tplEl.content.cloneNode(true));

    // jx-list: explicit container that points to array
    container.querySelectorAll("[jx-list]").forEach(listEl => {
      const path = listEl.getAttribute("jx-list") || ".";
      const arr = this.get(data, path);
      const itemEl = listEl.querySelector("[jx-item]");
      if (!Array.isArray(arr) || !itemEl) return;
      const parent = itemEl.parentNode;
      const proto = itemEl.cloneNode(true);
      parent.removeChild(itemEl);
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const clone = proto.cloneNode(true);
        this.interpolate(clone, item);
        clone.setAttribute('data-index', String(i));
        parent.appendChild(clone);
      }
    });

    // jx-item on its own: if data is root array repeat
    if (Array.isArray(data)) {
      container.querySelectorAll(":not([jx-list]) [jx-item], [jx-item]").forEach(itemEl => {
        if (itemEl.closest("[jx-list]")) return;
        const parent = itemEl.parentNode;
        const proto = itemEl.cloneNode(true);
        parent.removeChild(itemEl);
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const clone = proto.cloneNode(true);
          this.interpolate(clone, item);
          clone.setAttribute('data-index', String(i));
          parent.appendChild(clone);
        }
      });
    }

    // interpolate any remaining root-level placeholders with `data`
    container.childNodes.forEach(n => this.interpolate(n, data));

    const frag = document.createDocumentFragment();
    while (container.firstChild) frag.appendChild(container.firstChild);
    return frag;
  }

  async handle({ method = "GET", url, target, template }) {
    const targetEl = typeof target === "string" ? document.querySelector(target) : target;
    const tplEl = typeof template === "string" ? document.querySelector(template) : template;
    if (!targetEl || !tplEl) return console.error("[JASON] missing target/template");

    targetEl.innerHTML = `<em style="color:#666;">Loading...</em>`;
    try {
      const res = await fetch(url, { method, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const frag = this.renderFragment(tplEl, data);
      targetEl.innerHTML = "";
      targetEl.appendChild(frag);
    } catch (e) {
      targetEl.innerHTML = `<strong style="color:#c00;">Error: ${e.message}</strong>`;
    }
  }
}

const instance = new JASON();
instance.init();
export default instance;


