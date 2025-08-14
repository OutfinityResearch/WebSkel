import { g as m, s as c } from "./webSkel-CKLMNyJc.mjs";
import { R as k, W as E, h as V, l as w, c as A, W as P, o as b, d as C, b as S, i as x, m as R, a as L, n as N, e as U, j as B, r as M, k as I, f as O, u as T } from "./webSkel-CKLMNyJc.mjs";
async function u(n, i) {
  const t = m(n, "form"), a = {
    data: {},
    elements: {},
    isValid: !1
  };
  typeof t.checkValidity == "function" && (a.isValid = t.checkValidity());
  const o = [...t.querySelectorAll("[name]:not([type=hidden])")];
  for (const e of o) {
    if (e.disabled)
      continue;
    if (e.multiple && e.tagName === "SELECT" ? a.data[e.name] = Array.from(e.selectedOptions).map((r) => r.value) : a.data[e.name] = e.tagName === "CHECKBOX" || e.tagName === "INPUT" && e.type === "checkbox" ? e.checked : e.value, e.getAttribute("type") === "file")
      if (e.multiple)
        a.data[e.name] = e.files;
      else
        try {
          e.files.length > 0 && (a.data[e.name] = await d(e.files[0]));
        } catch (r) {
          console.log(r);
        }
    let s = !0;
    if (e.setCustomValidity(""), typeof e.checkValidity == "function" ? s = e.checkValidity() : typeof e.getInputElement == "function" && (s = (await e.getInputElement()).checkValidity()), s === !0 && i) {
      let r = e.getAttribute("data-condition");
      r && (s = i[r].fn(e, a), s ? e.setCustomValidity("") : (e.setCustomValidity(i[r].errorMessage), a.isValid = !1));
    }
    a.elements[e.name] = {
      isValid: s,
      element: e
    };
    let l = document.querySelector(`[data-id = '${e.getAttribute("id")}' ]`);
    l && (s ? l.classList.remove("input-invalid") : l.classList.add("input-invalid"));
  }
  t.checkValidity() || t.reportValidity();
  for (let e of Object.keys(a.data))
    a.elements[e] && a.elements[e].element && a.elements[e].element.hasAttribute("data-no-sanitize") || (a.data[e] = c(a.data[e]));
  return a;
}
async function d(n) {
  let i = "", t = new FileReader();
  return await new Promise((a, o) => {
    t.onload = function() {
      i = t.result, a(i);
    }, n ? t.readAsDataURL(n) : o("No file given as input at imageUpload");
  });
}
function p() {
  let n = navigator.userAgent, i, t = n.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  return /trident/i.test(t[1]) ? (i = /\brv[ :]+(\d+)/g.exec(n) || [], { name: "IE", version: i[1] || "" }) : t[1] === "Chrome" && (i = n.match(/\bOPR|Edge\/(\d+)/), i != null) ? { name: "Opera", version: i[1] } : (t = t[2] ? [t[1], t[2]] : [navigator.appName, navigator.appVersion, "-?"], (i = n.match(/version\/(\d+)/i)) != null && t.splice(1, 1, i[1]), {
    name: t[0],
    version: t[1]
  });
}
function g() {
  const n = window.location.search, i = new URLSearchParams(n);
  let t = {};
  for (let a of i.keys())
    t[a] = i.get(a);
  return t;
}
function h() {
  const n = window.location.hash.split("?");
  let i = {};
  if (n[1]) {
    const t = new URLSearchParams(n[1]);
    for (const [a, o] of t)
      i[a] = o;
    return i;
  }
  return i;
}
export {
  k as ResourceManager,
  E as WebSkel,
  V as closeModal,
  w as createTemplateArray,
  A as customTrim,
  P as default,
  u as extractFormInformation,
  b as findDoubleDollarWords,
  p as getBrowser,
  m as getClosestParentElement,
  C as getClosestParentWithPresenter,
  h as getHashParams,
  S as getMainAppContainer,
  g as getURLParams,
  d as imageUpload,
  x as invalidateParentElement,
  R as moveCursorToEnd,
  L as normalizeSpaces,
  N as notBasePage,
  U as refreshElement,
  B as removeActionBox,
  M as reverseQuerySelector,
  c as sanitize,
  I as showActionBox,
  O as showModal,
  T as unsanitize
};
