class x {
  constructor() {
    this.loadedStyleSheets = /* @__PURE__ */ new Map(), this.components = {};
  }
  async loadStyleSheets(e, t) {
    const n = [];
    return n.push(...e.map((a) => this.loadStyleSheet({
      cssText: a,
      identifier: t
    }))), (await Promise.all(n)).join("");
  }
  async loadStyleSheet({ url: e = null, cssText: t = null, identifier: n = null }) {
    if (!e && !t)
      return;
    const a = n || e;
    let i = this.loadedStyleSheets.get(a) || 0;
    if (i === 0)
      return new Promise((o, s) => {
        try {
          const l = document.createElement("style");
          l.textContent = t, n && (l.className = n), document.head.appendChild(l), this.loadedStyleSheets.set(a, i + 1), o(l.outerHTML);
        } catch (l) {
          s(new Error(`Failed to inject the CSS text: ${l.message}`));
        }
      });
    this.loadedStyleSheets.set(a, i + 1);
  }
  async unloadStyleSheets(e) {
    let t = this.loadedStyleSheets.get(e);
    t !== void 0 && (t -= 1, t <= 0 ? (this.removeStyleSheet(e), this.loadedStyleSheets.delete(e)) : this.loadedStyleSheets.set(e, t));
  }
  removeStyleSheet(e) {
    Array.from(document.head.querySelectorAll(`link[class="${e}"], style[class="${e}"]`)).forEach((n) => document.head.removeChild(n));
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
      isPromiseFulfilled: !1
    }, this.components[e.name].loadingPromise = (async () => {
      try {
        let t, n;
        e.directory ? (t = `./${f.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.html`, n = `./${f.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.css`) : (t = `./${f.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.html`, n = `./${f.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.css`);
        const a = e.loadedTemplate || await (await fetch(t)).text();
        this.components[e.name].html = a;
        const i = e.loadedCSSs || [await (await fetch(n)).text()];
        if (this.components[e.name].css = i, await this.loadStyleSheets(i, e.name), e.presenterClassName)
          if (e.presenterModule)
            this.registerPresenter(e.name, e.presenterModule[e.presenterClassName]);
          else {
            let o;
            e.directory ? o = `../../${f.instance.configs.webComponentsRootDir}/${e.directory}/${e.type}/${e.name}/${e.name}.js` : o = `../../${f.instance.configs.webComponentsRootDir}/${e.type}/${e.name}/${e.name}.js`;
            const s = await import(o);
            this.registerPresenter(e.name, s[e.presenterClassName]);
          }
        return this.components[e.name].isPromiseFulfilled = !0, { html: a, css: i };
      } catch (t) {
        throw t;
      }
    })();
  }
  registerPresenter(e, t) {
    this.components[e].presenter = t;
  }
  initialisePresenter(e, t, n, a = {}) {
    let i;
    try {
      i = new this.components[t.componentName].presenter(t, n, a), t.isPresenterReady = !0, t.onPresenterReady();
    } catch (o) {
      showApplicationError("Error creating a presenter instance", `Encountered an error during the initialization of ${e} for component: ${t.componentName}`, o + ":" + o.stack.split(`
`)[1]);
    }
    return i;
  }
}
function L(r) {
  if (!r) {
    console.error("moveCursorToEnd: No element provided");
    return;
  }
  if (document.activeElement !== r && r.focus(), typeof window.getSelection < "u" && typeof document.createRange < "u") {
    const e = document.createRange();
    e.selectNodeContents(r), e.collapse(!1);
    const t = window.getSelection();
    t.removeAllRanges(), t.addRange(e);
  } else if (typeof document.body.createTextRange < "u") {
    const e = document.body.createTextRange();
    e.moveToElementText(r), e.collapse(!1), e.select();
  }
}
function g(r, e, t) {
  let n = null;
  for (; r; ) {
    if (r.matches(e)) {
      n = r;
      break;
    } else if (t && r.matches(t))
      break;
    r = r.parentElement;
  }
  return n;
}
function w(r, e, t = "", n = !1) {
  const a = /* @__PURE__ */ new Set();
  if (!(r instanceof Element))
    throw new TypeError("The first argument must be a DOM Element.");
  if (typeof e != "string" || e.trim() === "")
    throw new TypeError("The second argument must be a non-empty string.");
  if (r.matches(e) && !n)
    return r;
  a.add(r);
  let i = r;
  for (; i; ) {
    const o = i.parentElement;
    if (o) {
      let s = o.firstElementChild;
      for (; s; ) {
        if (!a.has(s)) {
          if (a.add(s), s !== i && s.matches(e))
            return s;
          if (s.children.length > 0) {
            const l = [s.firstElementChild];
            for (; l.length > 0; ) {
              const d = l.shift();
              if (!a.has(d)) {
                if (a.add(d), d.matches(e))
                  return d;
                let c = d.nextElementSibling;
                for (; c; )
                  l.push(c), c = c.nextElementSibling;
                d.firstElementChild && l.push(d.firstElementChild);
              }
            }
          }
        }
        s = s.nextElementSibling;
      }
    }
    if (i = o, i && !a.has(i)) {
      if (a.add(i), i.matches(e))
        return i;
      if (t && i.matches(t))
        break;
    }
  }
  return null;
}
function R(r) {
  const e = (r.match(/\//g) || []).length;
  return !(e > 1 || e === 1 && r.charAt(r.length - 1) !== "/");
}
function A(r) {
  return r != null && typeof r == "string" ? r.replace(/&nbsp;/g, " ").replace(/&#13;/g, `
`).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "";
}
function y(r) {
  return r != null && typeof r == "string" ? r.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n/g, "&#13;").replace(/[\r\n]/g, "&#13;").replace(/\s/g, "&nbsp;") : r;
}
function M(r) {
  return r != null && typeof r == "string" ? r.replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : r;
}
function T(r) {
  return r.replace(/^[\u00A0\s]+|[\u00A0\s]+$/g, "").trim();
}
function O(r) {
  return g(r, ".app-container");
}
function b(r, e) {
  if (!r || !(r instanceof HTMLElement))
    return console.error("getClosestParentWithPresenter: Invalid or no element provided"), null;
  const t = e ? `[data-presenter="${e}"]` : "[data-presenter]";
  return w(r, t, "", !0);
}
function j(r) {
  if (!r || !(r instanceof HTMLElement))
    return console.error("invalidateParentElement: Invalid or no element provided"), null;
  E(b(r));
}
function E(r) {
  if (!r || !(r instanceof HTMLElement)) {
    console.error("refreshElement: Invalid or no element provided");
    return;
  }
  if (!r.webSkelPresenter || typeof r.webSkelPresenter.invalidate != "function") {
    console.error("refreshElement: Element does not have a webSkelPresenter with an invalidate method");
    return;
  }
  r.webSkelPresenter.invalidate();
}
const N = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  customTrim: T,
  getClosestParentElement: g,
  getClosestParentWithPresenter: b,
  getMainAppContainer: O,
  invalidateParentElement: j,
  moveCursorToEnd: L,
  normalizeSpaces: M,
  notBasePage: R,
  refreshElement: E,
  reverseQuerySelector: w,
  sanitize: y,
  unsanitize: A
}, Symbol.toStringTag, { value: "Module" }));
async function _(r, e) {
  const t = g(r, "form"), n = {
    data: {},
    elements: {},
    isValid: !1
  };
  typeof t.checkValidity == "function" && (n.isValid = t.checkValidity());
  const a = [...t.querySelectorAll("[name]:not([type=hidden])")];
  for (const i of a) {
    if (i.disabled)
      continue;
    if (i.multiple && i.tagName === "SELECT" ? n.data[i.name] = Array.from(i.selectedOptions).map((l) => l.value) : n.data[i.name] = i.tagName === "CHECKBOX" || i.tagName === "INPUT" && i.type === "checkbox" ? i.checked : i.value, i.getAttribute("type") === "file")
      if (i.multiple)
        n.data[i.name] = i.files;
      else
        try {
          i.files.length > 0 && (n.data[i.name] = await S(i.files[0]));
        } catch (l) {
          console.log(l);
        }
    let o = !0;
    if (i.setCustomValidity(""), typeof i.checkValidity == "function" ? o = i.checkValidity() : typeof i.getInputElement == "function" && (o = (await i.getInputElement()).checkValidity()), o === !0 && e) {
      let l = i.getAttribute("data-condition");
      l && (o = e[l].fn(i, n), o ? i.setCustomValidity("") : (i.setCustomValidity(e[l].errorMessage), n.isValid = !1));
    }
    n.elements[i.name] = {
      isValid: o,
      element: i
    };
    let s = document.querySelector(`[data-id = '${i.getAttribute("id")}' ]`);
    s && (o ? s.classList.remove("input-invalid") : s.classList.add("input-invalid"));
  }
  t.checkValidity() || t.reportValidity();
  for (let i of Object.keys(n.data))
    n.elements[i] && n.elements[i].element && n.elements[i].element.hasAttribute("data-no-sanitize") || (n.data[i] = y(n.data[i]));
  return n;
}
async function S(r) {
  let e = "", t = new FileReader();
  return await new Promise((n, a) => {
    t.onload = function() {
      e = t.result, n(e);
    }, r ? t.readAsDataURL(r) : a("No file given as input at imageUpload");
  });
}
async function D(r) {
  let e = "", t = new FileReader();
  return await new Promise((n, a) => {
    t.onload = function() {
      e = t.result, n(e);
    }, r ? t.readAsText(r) : a("No file given as input");
  });
}
const H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  extractFormInformation: _,
  imageUpload: S,
  uploadFileAsText: D
}, Symbol.toStringTag, { value: "Module" }));
async function P(r, e, t) {
  typeof e == "boolean" && (t = e, e = void 0);
  const n = document.querySelector("body"), a = g(n, "dialog");
  a && (a.close(), a.remove());
  const i = Object.assign(V(r, e), {
    component: r,
    cssClass: r,
    componentProps: e
  });
  return n.appendChild(i), await i.showModal(), i.addEventListener("keydown", v), t ? new Promise((o) => {
    i.addEventListener("close", (s) => {
      o(s.data);
    });
  }) : i;
}
function v(r) {
  r.key === "Escape" && r.preventDefault();
}
function V(r, e) {
  let t = document.createElement("dialog"), n = "";
  return e !== void 0 && Object.keys(e).forEach((i) => {
    n += ` data-${i}="${e[i]}"`;
  }), f.instance.configs.components.find((i) => i.name === r).presenterClassName && (n += ` data-presenter="${r}"`), n === "" ? t.innerHTML = `<${r}/>` : t.innerHTML = `<${r}${n}/>`, t.classList.add("modal", `${r}-dialog`), t;
}
function I(r, e) {
  const t = g(r, "dialog");
  if (e !== void 0) {
    let n = new Event("close", {
      bubbles: !0,
      cancelable: !0
    });
    n.data = e, t.dispatchEvent(n);
  }
  t && (t.close(), t.remove());
}
function C(r, e) {
  document.removeEventListener("click", r.clickHandler), r.remove(), e !== void 0 && delete e.actionBox;
}
async function U(r, e, t, n, a = {}) {
  if (r.parentNode.querySelector(t))
    return null;
  const o = document.createElement(`${t}`);
  for (const [d, c] of Object.entries(a))
    o.setAttribute(`data-${d}`, c);
  let s;
  switch (n) {
    case "prepend":
      r.parentNode.insertBefore(o, r);
      break;
    case "append":
      r.parentNode.appendChild(o);
      break;
    case "replace":
      s = r;
      const d = s.parentNode;
      d.removeChild(s), d.appendChild(o);
      break;
    case "replace-all":
      s = r.parentNode;
      const c = s;
      s = c.innerHTML, c.innerHTML = "", c.appendChild(o);
      break;
    default:
      console.error(`Invalid Insertion Mode: ${n}. No changes to the DOM have been made`);
      return;
  }
  let l = (d) => {
    if (o && !o.contains(d.target)) {
      if (n === "replace" && s) {
        const c = o.parentNode;
        c.removeChild(o), c.appendChild(s);
      } else if (n === "replace-all" && s) {
        const c = o.parentNode;
        c.innerHTML = s;
      }
      C(o);
    }
  };
  return o.clickHandler = l, document.addEventListener("click", l), o;
}
async function F(r, e, t = !1) {
  typeof e == "boolean" && (t = e, e = void 0);
  const n = document.querySelector("body"), a = g(n, "dialog");
  a && (a.close(), a.remove());
  let i = document.createElement("dialog");
  i.classList.add("modal", `${r}-dialog`);
  const o = window.WebSkel || assistOS.UI;
  if (!o)
    throw new Error("WebSkel instance not found for reactive modal");
  let s = o.configs.components.find((c) => c.name === r);
  const l = o.createElement(
    r,
    i,
    e || {},
    s?.presenterClassName ? { "data-presenter": r } : {},
    !0
  );
  Object.assign(i, {
    component: r,
    cssClass: r,
    componentProps: e,
    _componentProxy: l
  });
  const d = new Proxy(i, {
    get(c, h) {
      return h === "props" ? l : Reflect.get(c, h);
    }
  });
  return n.appendChild(i), await i.showModal(), i.addEventListener("keydown", v), t ? new Promise((c) => {
    i.addEventListener("close", (h) => {
      c(h.data);
    });
  }) : d;
}
const B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  closeModal: I,
  createReactiveModal: F,
  removeActionBox: C,
  showActionBox: U,
  showModal: P
}, Symbol.toStringTag, { value: "Module" }));
function $(r) {
  let e = /\$\$[\w\-_]+/g;
  return r.match(e) || [];
}
function k(r) {
  let e = 0;
  const t = 0, n = 1;
  function a(l) {
    return !/^[a-zA-Z0-9_\-$]$/.test(l);
  }
  function i(l) {
    return r[l] !== "$" || r[l + 1] !== "$" ? t : n;
  }
  let o = [], s = 0;
  for (; s < r.length; ) {
    for (; !i(s) && s < r.length; )
      s++;
    for (o.push(r.slice(e, s)), e = s; !a(r[s]) && s < r.length; )
      s++;
    o.push(r.slice(e, s)), e = s;
  }
  return o;
}
function q(r, e) {
  if (typeof r != "string" || r.trim() === "")
    throw new Error("Input data must be a non-empty string.");
  if (typeof e != "string" || e.trim() === "")
    throw new Error("MIME type must be a non-empty string.");
  try {
    return `data:${e};base64,` + window.btoa(r);
  } catch (t) {
    throw console.error("Error encoding data to Base64:", t), new Error("Failed to encode data to Base64.");
  }
}
function z(r) {
  if (typeof r != "string")
    throw new Error("Input must be a Base64 encoded string.");
  let e = r.split(","), t = e[0].startsWith("data:") ? e[1] : e[0];
  if (!t)
    throw new Error("Invalid Base64 data format.");
  try {
    return atob(t);
  } catch (n) {
    throw console.error("Error decoding Base64 string:", n), new Error("Failed to decode Base64 string.");
  }
}
const K = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createTemplateArray: k,
  decodeBase64: z,
  encodeToBase64: q,
  findDoubleDollarWords: $
}, Symbol.toStringTag, { value: "Module" }));
function Q() {
  let r = navigator.userAgent, e, t = r.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  return /trident/i.test(t[1]) ? (e = /\brv[ :]+(\d+)/g.exec(r) || [], { name: "IE", version: e[1] || "" }) : t[1] === "Chrome" && (e = r.match(/\bOPR|Edge\/(\d+)/), e != null) ? { name: "Opera", version: e[1] } : (t = t[2] ? [t[1], t[2]] : [navigator.appName, navigator.appVersion, "-?"], (e = r.match(/version\/(\d+)/i)) != null && t.splice(1, 1, e[1]), {
    name: t[0],
    version: t[1]
  });
}
function X() {
  const r = window.location.search, e = new URLSearchParams(r);
  let t = {};
  for (let n of e.keys())
    t[n] = e.get(n);
  return t;
}
function Z() {
  const r = window.location.hash.split("?");
  let e = {};
  if (r[1]) {
    const t = new URLSearchParams(r[1]);
    for (const [n, a] of t)
      e[n] = a;
    return e;
  }
  return e;
}
const G = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getBrowser: Q,
  getHashParams: Z,
  getURLParams: X
}, Symbol.toStringTag, { value: "Module" }));
class f {
  constructor() {
    this._appContent = {}, this.appServices = {}, this._documentElement = document, this.actionRegistry = {}, this.registerListeners(), this.ResourceManager = new x(), this.defaultLoader = document.createElement("dialog"), this.loaderCount = 0, this.defaultLoader.classList.add("spinner"), this.defaultLoader.classList.add("spinner-default-style"), window.showApplicationError = async (e, t, n) => await P("show-error-modal", {
      title: e,
      message: t,
      technical: n
    }), console.log("creating new app manager instance");
  }
  static async initialise(e) {
    if (f.instance)
      return f.instance;
    let t = new f();
    const n = [
      N,
      H,
      B,
      K,
      G
    ];
    for (const a of n)
      for (const [i, o] of Object.entries(a))
        t[i] = o;
    return await t.loadConfigs(e), f.instance = t, f.instance;
  }
  async loadConfigs(e) {
    try {
      const n = await (await fetch(e)).json();
      this.configs = n;
      for (const a of n.services) {
        const i = await import(a.path);
        this.initialiseService(i[a.name]);
      }
      for (const a of n.components)
        await this.defineComponent(a);
    } catch (t) {
      console.error(t), await window.showApplicationError("Error loading configs", "Error loading configs", `Encountered ${t} while trying loading webSkel configs`);
    }
  }
  initialiseService(e) {
    let t = new e();
    Object.getOwnPropertyNames(e.prototype).filter((a) => a !== "constructor").forEach((a) => {
      this.appServices[a] = t[a].bind(t);
    });
  }
  showLoading() {
    let e = this.defaultLoader.cloneNode(!0), t = crypto.randomUUID();
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
      document.querySelectorAll(".spinner").forEach((n) => {
        n.close(), n.remove();
      });
  }
  setLoading(e) {
    this.defaultLoader.innerHTML = e, this.defaultLoader.classList.remove("spinner-default-style");
  }
  resetLoading() {
    this.defaultLoader = document.createElement("dialog"), this.defaultLoader.classList.add("spinner"), this.defaultLoader.classList.add("spinner-default-style");
  }
  async changeToDynamicPage(e, t, n, a) {
    try {
      this.validateTagName(e);
    } catch (s) {
      await window.showApplicationError(s, s, s), console.error(s);
      return;
    }
    const i = this.showLoading();
    let o = "";
    n && (o = Object.entries(n).map(([s, l]) => `data-${s}="${l}"`).join(" "));
    try {
      const s = `<${e} data-presenter="${e}" ${o}></${e}>`;
      if (!a) {
        const l = ["#", t].join("");
        window.history.pushState({ pageHtmlTagName: e, relativeUrlContent: s }, l.toString(), l);
      }
      await this.updateAppContent(s);
    } catch (s) {
      console.error("Failed to change page", s);
    } finally {
      this.hideLoading(i);
    }
  }
  validateTagName(e) {
    if (!/^(?![0-9])[a-z0-9]+(?:-*[a-z0-9]+)*-*?$/.test(e))
      throw new Error(`Invalid tag name: ${e}`);
    if (!this.configs.components.find((a) => a.name === e))
      throw new Error(`Element not found in configs: ${e}`);
  }
  async changeToStaticPage(e, t) {
    const n = this.showLoading();
    try {
      const a = await this.fetchTextResult(e, t);
      await this.updateAppContent(a);
    } catch (a) {
      console.log("Failed to change page", a);
    } finally {
      this.hideLoading(n);
    }
  }
  async interceptAppContentLinks(e) {
    let t = e.target || e.srcElement;
    if (t.hasAttribute("data-page")) {
      let n = t.getAttribute("data-page");
      return e.preventDefault(), await this.changeToDynamicPage(n);
    }
    if (t.hasAttribute("data-path")) {
      let n = t.getAttribute("data-path");
      return e.preventDefault(), await this.changeToStaticPage(n);
    }
  }
  setDomElementForPages(e) {
    this._appContent = e;
  }
  async updateAppContent(e) {
    try {
      this.preventExternalResources(e);
    } catch (t) {
      await window.showApplicationError(t, t, t), console.error(t);
      return;
    }
    this._appContent.innerHTML = e;
  }
  preventExternalResources(e) {
    let t = /(src|href|action|onclick)\s*=\s*"[^"]*"/g, n = e.match(t);
    if (n)
      for (let a of n) {
        let i = a.split('"')[1], o = new URL(i).host;
        if (window.location.host !== o)
          throw new Error(`External resource detected: ${i}`);
      }
  }
  registerListeners() {
    this._documentElement.addEventListener("click", this.interceptAppContentLinks.bind(this)), window.onpopstate = (e) => {
      e.state && e.state.relativeUrlContent && this.updateAppContent(e.state.relativeUrlContent);
    }, this._documentElement.addEventListener("click", async (e) => {
      let t = e.target, n = !1;
      for (; t && t !== this._documentElement && !n; ) {
        if (t.hasAttribute("data-local-action")) {
          e.preventDefault(), e.stopPropagation(), n = !0;
          let a = t, i = !1;
          const o = t.getAttribute("data-local-action"), [s, ...l] = o.split(" ");
          for (; i === !1; ) {
            let d = !1, c;
            for (; d === !1; ) {
              if (a.webSkelPresenter) {
                d = !0, c = a.webSkelPresenter;
                break;
              }
              if (a = a.parentElement, a === document) {
                await window.showApplicationError("Error executing action", "Action not found in any Presenter", "Action not found in any Presenter");
                return;
              }
            }
            if (c[s] !== void 0)
              try {
                a.webSkelPresenter[s](t, ...l), i = !0;
              } catch (h) {
                console.error(h), await window.showApplicationError("Error executing action", "There is no action for the button to execute", `Encountered ${h}`);
                return;
              }
            else
              d = !1, a = a.parentElement;
          }
        } else if (t.hasAttribute("data-action")) {
          e.preventDefault(), e.stopPropagation(), n = !0;
          const a = t.getAttribute("data-action"), [i, ...o] = a.split(" ");
          i ? this.callAction(i, t, ...o) : console.error(`${t} : data action attribute value should not be empty!`);
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
    const n = this.actionRegistry[e];
    if (!n)
      throw new Error(`No action handler registered for "${e}"`);
    let a = t && t[0] instanceof HTMLElement ? t[0] : null;
    n.call(a, ...t);
  }
  async fetchTextResult(e, t) {
    const n = new URL(`${window.location.protocol}//${window.location.host}`);
    e.startsWith("#") && (e = e.slice(1)), console.log("Fetching Data from URL: ", n + e);
    const a = await fetch(n + e);
    if (!a.ok)
      throw new Error("Failed to execute request");
    const i = await a.text();
    if (!t) {
      const o = n + "#" + e;
      window.history.pushState({ relativeUrlPath: e, relativeUrlContent: i }, o.toString(), o);
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
  createElement(e, t = null, n = {}, a = {}, i = !1) {
    const o = document.createElement(e), { proxy: s, revoke: l } = this.createReactiveProxy(n, i, o);
    o.setAttribute("data-presenter", e);
    const d = {
      get(h, u, p) {
        if (u === "element")
          return new WeakRef(o);
        if (u in s)
          return Reflect.get(s, u, p);
        if (u in o) {
          const m = o[u];
          return typeof m == "function" ? m.bind(o) : m;
        }
        return Reflect.get(h, u, p);
      },
      set(h, u, p, m) {
        return u === "element" ? !1 : u in s ? Reflect.set(s, u, p, m) : u in o ? (o[u] = p, !0) : Reflect.set(s, u, p, m);
      },
      has(h, u) {
        return u === "element" || u in s || u in o;
      },
      ownKeys(h) {
        const u = Reflect.ownKeys(s), p = Reflect.ownKeys(o);
        return [.../* @__PURE__ */ new Set([...u, ...p, "element"])];
      },
      getOwnPropertyDescriptor(h, u) {
        return u === "element" ? {
          value: new WeakRef(o),
          writable: !1,
          enumerable: !0,
          configurable: !1
        } : u in s ? Reflect.getOwnPropertyDescriptor(s, u) : u in o ? Reflect.getOwnPropertyDescriptor(o, u) : Reflect.getOwnPropertyDescriptor(h, u);
      }
    }, c = new Proxy({}, d);
    return o._webSkelProps = {
      raw: n,
      proxy: s,
      revoke: l,
      observeProps: i
    }, Object.entries(a).forEach(([h, u]) => {
      o.setAttribute(h, u);
    }), t instanceof HTMLElement ? t?.appendChild(o) : typeof t == "string" && document.querySelector(t)?.appendChild(o), c;
  }
  /**
   * Creates a reactive proxy for an object that triggers an element invalidation on property changes.
   * @param {Object} target - The target object to wrap in a reactive proxy.
   * @param {boolean} observe - If true, nested objects are also wrapped in reactive proxies.
   * @param {HTMLElement} element - The element whose invalidate method is called on property changes.
   * @returns {{proxy: Proxy, revoke: Function}} An object containing the reactive proxy and a revoke function.
   */
  createReactiveProxy(e, t, n) {
    const a = {
      set(s, l, d) {
        t && typeof d == "object" && d !== null && (d = this.createReactiveProxy(d, t, n).proxy);
        const c = s[l];
        return s[l] = d, Object.is(c, d) || n.invalidateProxy?.(), !0;
      },
      deleteProperty(s, l) {
        return delete s[l], n.invalidateProxy?.(), !0;
      }
    }, { proxy: i, revoke: o } = Proxy.revocable(e, a);
    if (t)
      for (const s in e)
        typeof e[s] == "object" && e[s] !== null && (e[s] = this.createReactiveProxy(e[s], t, n).proxy);
    return { proxy: i, revoke: o };
  }
  defineComponent = async (e) => {
    customElements.get(e.name) || customElements.define(
      e.name,
      class extends HTMLElement {
        constructor() {
          super(), this.variables = {}, this.componentName = e.name, this.props = {}, this.presenterReadyPromise = new Promise((t) => {
            this.onPresenterReady = t;
          }), this.isPresenterReady = !1;
        }
        invalidateProxy() {
          this.invalidateFn && this.invalidateFn();
        }
        async connectedCallback() {
          this._webSkelProps && (this.props = this._webSkelProps.proxy), this.resources = await f.instance.ResourceManager.loadComponent(e), $(this.resources.html).forEach((i) => {
            i = i.slice(2), this.variables[i] = "";
          }), this.templateArray = k(this.resources.html);
          let n = this, a = null;
          for (const i of n.attributes)
            n.variables[i.nodeName] = y(i.nodeValue), i.name === "data-presenter" && (a = i.nodeValue);
          if (a) {
            const i = async (s) => {
              const l = (c) => {
                n.innerHTML = `Error rendering component: ${n.componentName}
: ` + c + c.stack.split(`
`)[1], console.error(c), f.instance.hideLoading();
              }, d = async () => {
                try {
                  await n.webSkelPresenter.beforeRender();
                  for (let c in n.variables)
                    typeof n.webSkelPresenter[c] < "u" && (n.variables[c] = n.webSkelPresenter[c]);
                  n.refresh(), await n.webSkelPresenter.afterRender?.();
                } catch (c) {
                  l(c);
                }
              };
              if (f.instance.showLoading(), s)
                try {
                  await s();
                } catch (c) {
                  return l(c);
                }
              await d(), f.instance.hideLoading();
            }, o = new Proxy(i, {
              apply: async function(s, l, d) {
                return n.isPresenterReady || await n.presenterReadyPromise, Reflect.apply(s, l, d);
              }
            });
            n.invalidateFn = o, n.webSkelPresenter = f.instance.ResourceManager.initialisePresenter(a, n, o, this.props);
          } else
            n.refresh();
        }
        async disconnectedCallback() {
          this._webSkelProps?.revoke(), this.webSkelPresenter && this.webSkelPresenter.afterUnload && await this.webSkelPresenter.afterUnload(), this.resources && this.resources.css && await f.instance.ResourceManager.unloadStyleSheets(this.componentName);
        }
        refresh() {
          let t = "";
          for (let n of this.templateArray)
            n.startsWith("$$") ? t += this.variables[n.slice(2)] : t += n;
          this.innerHTML = t;
        }
      }
    );
  };
}
export {
  x as ResourceManager,
  f as WebSkel,
  I as closeModal,
  k as createTemplateArray,
  T as customTrim,
  f as default,
  _ as extractFormInformation,
  $ as findDoubleDollarWords,
  Q as getBrowser,
  g as getClosestParentElement,
  b as getClosestParentWithPresenter,
  Z as getHashParams,
  O as getMainAppContainer,
  X as getURLParams,
  S as imageUpload,
  j as invalidateParentElement,
  L as moveCursorToEnd,
  M as normalizeSpaces,
  R as notBasePage,
  E as refreshElement,
  C as removeActionBox,
  w as reverseQuerySelector,
  y as sanitize,
  U as showActionBox,
  P as showModal,
  A as unsanitize
};
