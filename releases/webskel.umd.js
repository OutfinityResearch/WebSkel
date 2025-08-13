var WebSkel = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // releases/webskel.mjs
  var webskel_exports = {};
  __export(webskel_exports, {
    default: () => d
  });
  function w(o) {
    let e = /\$\$[\w\-_]+/g;
    return o.match(e) || [];
  }
  function m(o) {
    let e = 0;
    const t = 0, s = 1;
    function r(l) {
      return !/^[a-zA-Z0-9_\-$]$/.test(l);
    }
    function i(l) {
      return o[l] !== "$" || o[l + 1] !== "$" ? t : s;
    }
    let a = [], n = 0;
    for (; n < o.length; ) {
      for (; !i(n) && n < o.length; )
        n++;
      for (a.push(o.slice(e, n)), e = n; !r(o[n]) && n < o.length; )
        n++;
      a.push(o.slice(e, n)), e = n;
    }
    return a;
  }
  function g(o, e, t) {
    let s = null;
    for (; o; ) {
      if (o.matches(e)) {
        s = o;
        break;
      }
      o = o.parentElement;
    }
    return s;
  }
  function E(o) {
    return o != null && typeof o == "string" ? o.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n/g, "&#13;").replace(/[\r\n]/g, "&#13;").replace(/\s/g, "&nbsp;") : o;
  }
  async function S(o, e, t) {
    typeof e == "boolean" && (t = e, e = void 0);
    const s = document.querySelector("body"), r = g(s, "dialog");
    r && (r.close(), r.remove());
    const i = Object.assign($(o, e), {
      component: o,
      cssClass: o,
      componentProps: e
    });
    return s.appendChild(i), await i.showModal(), i.addEventListener("keydown", P), t ? new Promise((a) => {
      i.addEventListener("close", (n) => {
        a(n.data);
      });
    }) : i;
  }
  function P(o) {
    o.key === "Escape" && o.preventDefault();
  }
  function $(o, e) {
    let t = document.createElement("dialog"), s = "";
    return e !== void 0 && Object.keys(e).forEach((i) => {
      s += ` data-${i}="${e[i]}"`;
    }), d.instance.configs.components.find((i) => i.name === o).presenterClassName && (s += ` data-presenter="${o}"`), s === "" ? t.innerHTML = `<${o}/>` : t.innerHTML = `<${o}${s}/>`, t.classList.add("modal", `${o}-dialog`), t;
  }
  var b = class {
    constructor() {
      this.loadedStyleSheets = /* @__PURE__ */ new Map(), this.components = {};
    }
    async loadStyleSheets(e, t) {
      const s = [];
      return s.push(...e.map((r) => this.loadStyleSheet({
        cssText: r,
        identifier: t
      }))), (await Promise.all(s)).join("");
    }
    async loadStyleSheet({ url: e = null, cssText: t = null, identifier: s = null }) {
      if (!e && !t)
        return;
      const r = s || e;
      let i = this.loadedStyleSheets.get(r) || 0;
      if (i === 0)
        return new Promise((a, n) => {
          try {
            const l = document.createElement("style");
            l.textContent = t, s && (l.className = s), document.head.appendChild(l), this.loadedStyleSheets.set(r, i + 1), a(l.outerHTML);
          } catch (l) {
            n(new Error(`Failed to inject the CSS text: ${l.message}`));
          }
        });
      this.loadedStyleSheets.set(r, i + 1);
    }
    async unloadStyleSheets(e) {
      let t = this.loadedStyleSheets.get(e);
      t !== void 0 && (t -= 1, t <= 0 ? (this.removeStyleSheet(e), this.loadedStyleSheets.delete(e)) : this.loadedStyleSheets.set(e, t));
    }
    removeStyleSheet(e) {
      Array.from(document.head.querySelectorAll(`link[class="${e}"], style[class="${e}"]`)).forEach((s) => document.head.removeChild(s));
    }
    async loadComponent(e) {
      if (this.components[e.name]) {
        if (this.components[e.name].isPromiseFulfilled)
          return await this.loadStyleSheets(this.components[e.name].css, e.name), {
            html: this.components[e.name].html,
            css: this.components[e.name].css
          };
        {
          let t = await this.components[e.name].loadingPromise;
          return await this.loadStyleSheets(t.css, e.name), t;
        }
      } else return this.components[e.name] = {
        html: "",
        css: [],
        presenter: null,
        loadingPromise: null,
        isPromiseFulfilled: false
      }, this.components[e.name].loadingPromise = (async () => {
        try {
          let t, s;
          e.directory ? (t = `./${d.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.html`, s = `./${d.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.css`) : (t = `./${d.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.html`, s = `./${d.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.css`);
          const r = e.loadedTemplate || await (await fetch(t)).text();
          this.components[e.name].html = r;
          const i = e.loadedCSSs || [await (await fetch(s)).text()];
          if (this.components[e.name].css = i, await this.loadStyleSheets(i, e.name), e.presenterClassName)
            if (e.presenterModule)
              this.registerPresenter(e.name, e.presenterModule[e.presenterClassName]);
            else {
              let a;
              e.directory ? a = `../../${d.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.js` : a = `../../${d.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.js`;
              const n = await import(a);
              this.registerPresenter(e.name, n[e.presenterClassName]);
            }
          return this.components[e.name].isPromiseFulfilled = true, { html: r, css: i };
        } catch (t) {
          throw t;
        }
      })();
    }
    registerPresenter(e, t) {
      this.components[e].presenter = t;
    }
    initialisePresenter(e, t, s, r = {}) {
      let i;
      try {
        i = new this.components[t.componentName].presenter(t, s, r), t.isPresenterReady = true, t.onPresenterReady();
      } catch (a) {
        showApplicationError("Error creating a presenter instance", `Encountered an error during the initialization of ${e} for component: ${t.componentName}`, a + ":" + a.stack.split(`
`)[1]);
      }
      return i;
    }
  };
  var d = class _d {
    constructor() {
      this._appContent = {}, this.appServices = {}, this._documentElement = document, this.actionRegistry = {}, this.registerListeners(), this.ResourceManager = new b(), this.defaultLoader = document.createElement("dialog"), this.loaderCount = 0, this.defaultLoader.classList.add("spinner"), this.defaultLoader.classList.add("spinner-default-style"), window.showApplicationError = async (e, t, s) => await S("show-error-modal", {
        title: e,
        message: t,
        technical: s
      }), console.log("creating new app manager instance");
    }
    static async initialise(e) {
      if (_d.instance)
        return _d.instance;
      let t = new _d();
      const s = [
        "./utils/dom-utils.js",
        "./utils/form-utils.js",
        "./utils/modal-utils.js",
        "./utils/template-utils.js",
        "./utils/browser-utils.js"
      ];
      for (const r of s) {
        const i = await import(r);
        for (const [a, n] of Object.entries(i))
          t[a] = n;
      }
      return await t.loadConfigs(e), _d.instance = t, _d.instance;
    }
    async loadConfigs(e) {
      try {
        const s = await (await fetch(e)).json();
        this.configs = s;
        for (const r of s.services) {
          const i = await import(r.path);
          this.initialiseService(i[r.name]);
        }
        for (const r of s.components)
          await this.defineComponent(r);
      } catch (t) {
        console.error(t), await showApplicationError("Error loading configs", "Error loading configs", `Encountered ${t} while trying loading webSkel configs`);
      }
    }
    initialiseService(e) {
      let t = new e();
      Object.getOwnPropertyNames(e.prototype).filter((r) => r !== "constructor").forEach((r) => {
        this.appServices[r] = t[r].bind(t);
      });
    }
    showLoading() {
      let e = this.defaultLoader.cloneNode(true), t = crypto.randomUUID();
      return e.setAttribute("data-id", t), this.loaderCount === 0 ? (document.body.appendChild(e), e.showModal()) : this.loaderCount++, t;
    }
    hideLoading(e) {
      if (this.loaderCount > 1) {
        this.loaderCount--;
        return;
      }
      if (e) {
        let t = document.querySelector(`[data-id = '${e}' ]`);
        t && (t.close(), t.remove());
      } else
        document.querySelectorAll(".spinner").forEach((s) => {
          s.close(), s.remove();
        });
    }
    setLoading(e) {
      this.defaultLoader.innerHTML = e, this.defaultLoader.classList.remove("spinner-default-style");
    }
    resetLoading() {
      this.defaultLoader = document.createElement("dialog"), this.defaultLoader.classList.add("spinner"), this.defaultLoader.classList.add("spinner-default-style");
    }
    async changeToDynamicPage(e, t, s, r) {
      try {
        this.validateTagName(e);
      } catch (n) {
        showApplicationError(n, n, n), console.error(n);
        return;
      }
      const i = this.showLoading();
      let a = "";
      s && (a = Object.entries(s).map(([n, l]) => `data-${n}="${l}"`).join(" "));
      try {
        const n = `<${e} data-presenter="${e}" ${a}></${e}>`;
        if (!r) {
          const l = ["#", t].join("");
          window.history.pushState({ pageHtmlTagName: e, relativeUrlContent: n }, l.toString(), l);
        }
        this.updateAppContent(n);
      } catch (n) {
        console.error("Failed to change page", n);
      } finally {
        this.hideLoading(i);
      }
    }
    validateTagName(e) {
      if (!/^(?![0-9])[a-z0-9]+(?:-*[a-z0-9]+)*-*?$/.test(e))
        throw new Error(`Invalid tag name: ${e}`);
      if (!this.configs.components.find((r) => r.name === e))
        throw new Error(`Element not found in configs: ${e}`);
    }
    async changeToStaticPage(e, t) {
      const s = this.showLoading();
      try {
        const r = await this.fetchTextResult(e, t);
        this.updateAppContent(r);
      } catch (r) {
        console.log("Failed to change page", r);
      } finally {
        this.hideLoading(s);
      }
    }
    async interceptAppContentLinks(e) {
      let t = e.target || e.srcElement;
      if (t.hasAttribute("data-page")) {
        let s = t.getAttribute("data-page");
        return e.preventDefault(), await this.changeToDynamicPage(s);
      }
      if (t.hasAttribute("data-path")) {
        let s = t.getAttribute("data-path");
        return e.preventDefault(), await this.changeToStaticPage(s);
      }
    }
    setDomElementForPages(e) {
      this._appContent = e;
    }
    updateAppContent(e) {
      try {
        this.preventExternalResources(e);
      } catch (t) {
        showApplicationError(t, t, t), console.error(t);
        return;
      }
      this._appContent.innerHTML = e;
    }
    preventExternalResources(e) {
      let t = /(src|href|action|onclick)\s*=\s*"[^"]*"/g, s = e.match(t);
      if (s)
        for (let r of s) {
          let i = r.split('"')[1], a = new URL(i).host;
          if (window.location.host !== a)
            throw new Error(`External resource detected: ${i}`);
        }
    }
    registerListeners() {
      this._documentElement.addEventListener("click", this.interceptAppContentLinks.bind(this)), window.onpopstate = (e) => {
        e.state && e.state.relativeUrlContent && this.updateAppContent(e.state.relativeUrlContent);
      }, this._documentElement.addEventListener("click", async (e) => {
        let t = e.target, s = false;
        for (; t && t !== this._documentElement && !s; ) {
          if (t.hasAttribute("data-local-action")) {
            e.preventDefault(), e.stopPropagation(), s = true;
            let r = t, i = false;
            const a = t.getAttribute("data-local-action"), [n, ...l] = a.split(" ");
            for (; i === false; ) {
              let u = false, h;
              for (; u === false; ) {
                if (r.webSkelPresenter) {
                  u = true, h = r.webSkelPresenter;
                  break;
                }
                if (r = r.parentElement, r === document) {
                  await showApplicationError("Error executing action", "Action not found in any Presenter", "Action not found in any Presenter");
                  return;
                }
              }
              if (h[n] !== void 0)
                try {
                  r.webSkelPresenter[n](t, ...l), i = true;
                } catch (f) {
                  console.error(f), await showApplicationError("Error executing action", "There is no action for the button to execute", `Encountered ${f}`);
                  return;
                }
              else
                u = false, r = r.parentElement;
            }
          } else if (t.hasAttribute("data-action")) {
            e.preventDefault(), e.stopPropagation(), s = true;
            const r = t.getAttribute("data-action"), [i, ...a] = r.split(" ");
            i ? this.callAction(i, t, ...a) : console.error(`${t} : data action attribute value should not be empty!`);
            break;
          }
          t = t.parentElement;
        }
      });
    }
    registerAction(e, t) {
      this.actionRegistry[e] = t;
    }
    callAction(e, ...t) {
      const s = this.actionRegistry[e];
      if (!s)
        throw new Error(`No action handler registered for "${e}"`);
      let r = t && t[0] instanceof HTMLElement ? t[0] : null;
      s.call(r, ...t);
    }
    async fetchTextResult(e, t) {
      const s = new URL(`${window.location.protocol}//${window.location.host}`);
      e.startsWith("#") && (e = e.slice(1)), console.log("Fetching Data from URL: ", s + e);
      const r = await fetch(s + e);
      if (!r.ok)
        throw new Error("Failed to execute request");
      const i = await r.text();
      if (!t) {
        const a = s + "#" + e;
        window.history.pushState({ relativeUrlPath: e, relativeUrlContent: i }, a.toString(), a);
      }
      return i;
    }
    /**
     * Creates a custom element with reactive properties.
     * @param {string} elementName - The tag name of the custom element.
     * @param {HTMLElement|string|null} [location=null] - The parent element or a selector where the element will be appended.
     * @param {Object} [attributes={}] - An object containing attributes to set on the element.
     * @param {Object} [props={}] - An object containing initial properties for reactive proxying.
     * @param {boolean} [observeProps=false] - If true, nested objects in props will be observed.
     * @returns {Proxy} A reactive proxy for the element's properties.
     */
    createElement(e, t = null, s = {}, r = {}, i = false) {
      const a = document.createElement(e), { proxy: n, revoke: l } = this.createReactiveProxy(s, i, a);
      a.setAttribute("data-presenter", e);
      const u = {
        get(f, c, y) {
          if (c === "element")
            return new WeakRef(a);
          if (c in n)
            return Reflect.get(n, c, y);
          if (c in a) {
            const p = a[c];
            return typeof p == "function" ? p.bind(a) : p;
          }
          return Reflect.get(f, c, y);
        },
        set(f, c, y, p) {
          return c === "element" ? false : c in n ? Reflect.set(n, c, y, p) : c in a ? (a[c] = y, true) : Reflect.set(n, c, y, p);
        },
        has(f, c) {
          return c === "element" || c in n || c in a;
        },
        ownKeys(f) {
          const c = Reflect.ownKeys(n), y = Reflect.ownKeys(a);
          return [.../* @__PURE__ */ new Set([...c, ...y, "element"])];
        },
        getOwnPropertyDescriptor(f, c) {
          return c === "element" ? {
            value: new WeakRef(a),
            writable: false,
            enumerable: true,
            configurable: false
          } : c in n ? Reflect.getOwnPropertyDescriptor(n, c) : c in a ? Reflect.getOwnPropertyDescriptor(a, c) : Reflect.getOwnPropertyDescriptor(f, c);
        }
      }, h = new Proxy({}, u);
      return a._webSkelProps = {
        raw: s,
        proxy: n,
        revoke: l,
        observeProps: i
      }, Object.entries(r).forEach(([f, c]) => {
        a.setAttribute(f, c);
      }), t instanceof HTMLElement ? t?.appendChild(a) : typeof t == "string" && document.querySelector(t)?.appendChild(a), h;
    }
    /**
     * Creates a reactive proxy for an object that triggers an element invalidation on property changes.
     * @param {Object} target - The target object to wrap in a reactive proxy.
     * @param {boolean} observe - If true, nested objects are also wrapped in reactive proxies.
     * @param {HTMLElement} element - The element whose invalidate method is called on property changes.
     * @returns {{proxy: Proxy, revoke: Function}} An object containing the reactive proxy and a revoke function.
     */
    createReactiveProxy(e, t, s) {
      const r = {
        set(n, l, u) {
          t && typeof u == "object" && u !== null && (u = this.createReactiveProxy(u, t, s).proxy);
          const h = n[l];
          return n[l] = u, Object.is(h, u) || s.invalidateProxy?.(), true;
        },
        deleteProperty(n, l) {
          return delete n[l], s.invalidateProxy?.(), true;
        }
      }, { proxy: i, revoke: a } = Proxy.revocable(e, r);
      if (t)
        for (const n in e)
          typeof e[n] == "object" && e[n] !== null && (e[n] = this.createReactiveProxy(e[n], t, s).proxy);
      return { proxy: i, revoke: a };
    }
    defineComponent = async (e) => {
      customElements.get(e.name) || customElements.define(
        e.name,
        class extends HTMLElement {
          constructor() {
            super(), this.variables = {}, this.componentName = e.name, this.props = {}, this.presenterReadyPromise = new Promise((t) => {
              this.onPresenterReady = t;
            }), this.isPresenterReady = false;
          }
          invalidateProxy() {
            this.invalidateFn && this.invalidateFn();
          }
          async connectedCallback() {
            this._webSkelProps && (this.props = this._webSkelProps.proxy), this.resources = await _d.instance.ResourceManager.loadComponent(e), w(this.resources.html).forEach((i) => {
              i = i.slice(2), this.variables[i] = "";
            }), this.templateArray = m(this.resources.html);
            let s = this, r = null;
            for (const i of s.attributes)
              s.variables[i.nodeName] = E(i.nodeValue), i.name === "data-presenter" && (r = i.nodeValue);
            if (r) {
              const i = async (n) => {
                const l = (h) => {
                  s.innerHTML = `Error rendering component: ${s.componentName}
: ` + h + h.stack.split(`
`)[1], console.error(h), _d.instance.hideLoading();
                }, u = async () => {
                  try {
                    await s.webSkelPresenter.beforeRender();
                    for (let h in s.variables)
                      typeof s.webSkelPresenter[h] < "u" && (s.variables[h] = s.webSkelPresenter[h]);
                    s.refresh(), await s.webSkelPresenter.afterRender?.();
                  } catch (h) {
                    l(h);
                  }
                };
                if (_d.instance.showLoading(), n)
                  try {
                    await n();
                  } catch (h) {
                    return l(h);
                  }
                await u(), _d.instance.hideLoading();
              }, a = new Proxy(i, {
                apply: async function(n, l, u) {
                  return s.isPresenterReady || await s.presenterReadyPromise, Reflect.apply(n, l, u);
                }
              });
              s.invalidateFn = a, s.webSkelPresenter = _d.instance.ResourceManager.initialisePresenter(r, s, a, this.props);
            } else
              s.refresh();
          }
          async disconnectedCallback() {
            this._webSkelProps?.revoke(), this.webSkelPresenter && this.webSkelPresenter.afterUnload && await this.webSkelPresenter.afterUnload(), this.resources && this.resources.css && await _d.instance.ResourceManager.unloadStyleSheets(this.componentName);
          }
          refresh() {
            let t = "";
            for (let s of this.templateArray)
              s.startsWith("$$") ? t += this.variables[s.slice(2)] : t += s;
            this.innerHTML = t;
          }
        }
      );
    };
  };
  return __toCommonJS(webskel_exports);
})();
