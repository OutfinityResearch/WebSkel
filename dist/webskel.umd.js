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

  // bundle-entry.js
  var bundle_entry_exports = {};
  __export(bundle_entry_exports, {
    ResourceManager: () => ResourceManager,
    browserUtils: () => browser_utils_exports,
    default: () => bundle_entry_default,
    domUtils: () => dom_utils_exports,
    formUtils: () => form_utils_exports,
    modalUtils: () => modal_utils_exports,
    templateUtils: () => template_utils_exports
  });

  // utils/template-utils.js
  var template_utils_exports = {};
  __export(template_utils_exports, {
    createTemplateArray: () => createTemplateArray,
    decodeBase64: () => decodeBase64,
    encodeToBase64: () => encodeToBase64,
    findDoubleDollarWords: () => findDoubleDollarWords
  });
  function findDoubleDollarWords(str) {
    let regex = /\$\$[\w\-_]+/g;
    return str.match(regex) || [];
  }
  function createTemplateArray(str) {
    let currentPos = 0;
    const STR_TOKEN = 0;
    const VAR_TOKEN = 1;
    function isSeparator(ch) {
      const regex = /^[a-zA-Z0-9_\-$]$/;
      return !regex.test(ch);
    }
    function startVariable(cp) {
      if (str[cp] !== "$" || str[cp + 1] !== "$") {
        return STR_TOKEN;
      } else {
        return VAR_TOKEN;
      }
    }
    let result = [];
    let k = 0;
    while (k < str.length) {
      while (!startVariable(k) && k < str.length) {
        k++;
      }
      result.push(str.slice(currentPos, k));
      currentPos = k;
      while (!isSeparator(str[k]) && k < str.length) {
        k++;
      }
      result.push(str.slice(currentPos, k));
      currentPos = k;
    }
    return result;
  }
  function encodeToBase64(dataString, mimeType) {
    if (typeof dataString !== "string" || dataString.trim() === "") {
      throw new Error("Input data must be a non-empty string.");
    }
    if (typeof mimeType !== "string" || mimeType.trim() === "") {
      throw new Error("MIME type must be a non-empty string.");
    }
    try {
      return `data:${mimeType};base64,` + window.btoa(dataString);
    } catch (error) {
      console.error("Error encoding data to Base64:", error);
      throw new Error("Failed to encode data to Base64.");
    }
  }
  function decodeBase64(base64EncodedData) {
    if (typeof base64EncodedData !== "string") {
      throw new Error("Input must be a Base64 encoded string.");
    }
    let splitedArr = base64EncodedData.split(",");
    let base64Data = splitedArr[0].startsWith("data:") ? splitedArr[1] : splitedArr[0];
    if (!base64Data) {
      throw new Error("Invalid Base64 data format.");
    }
    try {
      return atob(base64Data);
    } catch (error) {
      console.error("Error decoding Base64 string:", error);
      throw new Error("Failed to decode Base64 string.");
    }
  }

  // utils/modal-utils.js
  var modal_utils_exports = {};
  __export(modal_utils_exports, {
    closeModal: () => closeModal,
    createReactiveModal: () => createReactiveModal,
    removeActionBox: () => removeActionBox,
    showActionBox: () => showActionBox,
    showModal: () => showModal
  });

  // utils/dom-utils.js
  var dom_utils_exports = {};
  __export(dom_utils_exports, {
    customTrim: () => customTrim,
    getClosestParentElement: () => getClosestParentElement,
    getClosestParentWithPresenter: () => getClosestParentWithPresenter,
    getMainAppContainer: () => getMainAppContainer,
    invalidateParentElement: () => invalidateParentElement,
    moveCursorToEnd: () => moveCursorToEnd,
    normalizeSpaces: () => normalizeSpaces,
    notBasePage: () => notBasePage,
    refreshElement: () => refreshElement,
    reverseQuerySelector: () => reverseQuerySelector,
    sanitize: () => sanitize,
    unsanitize: () => unsanitize
  });
  function moveCursorToEnd(el) {
    if (!el) {
      console.error("moveCursorToEnd: No element provided");
      return;
    }
    if (document.activeElement !== el) {
      el.focus();
    }
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (typeof document.body.createTextRange !== "undefined") {
      const textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  }
  function getClosestParentElement(element, selector, stopSelector) {
    let closestParent = null;
    while (element) {
      if (element.matches(selector)) {
        closestParent = element;
        break;
      } else if (stopSelector && element.matches(stopSelector)) {
        break;
      }
      element = element.parentElement;
    }
    return closestParent;
  }
  function reverseQuerySelector(startElement, targetSelector, stopSelector = "", ignoreStartElement = false) {
    const visited = /* @__PURE__ */ new Set();
    if (!(startElement instanceof Element)) {
      throw new TypeError("The first argument must be a DOM Element.");
    }
    if (typeof targetSelector !== "string" || targetSelector.trim() === "") {
      throw new TypeError("The second argument must be a non-empty string.");
    }
    if (startElement.matches(targetSelector) && !ignoreStartElement) {
      return startElement;
    }
    visited.add(startElement);
    let currentElement = startElement;
    while (currentElement) {
      const parent = currentElement.parentElement;
      if (parent) {
        let sibling = parent.firstElementChild;
        while (sibling) {
          if (!visited.has(sibling)) {
            visited.add(sibling);
            if (sibling !== currentElement && sibling.matches(targetSelector)) {
              return sibling;
            } else {
              if (sibling.children.length > 0) {
                const bfsQueue = [sibling.firstElementChild];
                while (bfsQueue.length > 0) {
                  const element = bfsQueue.shift();
                  if (!visited.has(element)) {
                    visited.add(element);
                    if (element.matches(targetSelector)) {
                      return element;
                    }
                    let nextSibling = element.nextElementSibling;
                    while (nextSibling) {
                      bfsQueue.push(nextSibling);
                      nextSibling = nextSibling.nextElementSibling;
                    }
                    if (element.firstElementChild) {
                      bfsQueue.push(element.firstElementChild);
                    }
                  }
                }
              }
            }
          }
          sibling = sibling.nextElementSibling;
        }
      }
      currentElement = parent;
      if (currentElement && !visited.has(currentElement)) {
        visited.add(currentElement);
        if (currentElement.matches(targetSelector)) {
          return currentElement;
        }
        if (stopSelector && currentElement.matches(stopSelector)) {
          break;
        }
      }
    }
    return null;
  }
  function notBasePage(url) {
    const slashCount = (url.match(/\//g) || []).length;
    return !(slashCount > 1 || slashCount === 1 && url.charAt(url.length - 1) !== "/");
  }
  function unsanitize(value) {
    if (value != null && typeof value === "string") {
      return value.replace(/&nbsp;/g, " ").replace(/&#13;/g, "\n").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
    return "";
  }
  function sanitize(value) {
    if (value != null && typeof value === "string") {
      return value.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n/g, "&#13;").replace(/[\r\n]/g, "&#13;").replace(/\s/g, "&nbsp;");
    }
    return value;
  }
  function normalizeSpaces(value) {
    if (value != null && typeof value === "string") {
      return value.replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    }
    return value;
  }
  function customTrim(str) {
    return str.replace(/^[\u00A0\s]+|[\u00A0\s]+$/g, "").trim();
  }
  function getMainAppContainer(element) {
    return getClosestParentElement(element, ".app-container");
  }
  function getClosestParentWithPresenter(element, presenterName) {
    if (!element || !(element instanceof HTMLElement)) {
      console.error("getClosestParentWithPresenter: Invalid or no element provided");
      return null;
    }
    const selector = presenterName ? `[data-presenter="${presenterName}"]` : "[data-presenter]";
    return reverseQuerySelector(element, selector, "", true);
  }
  function invalidateParentElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      console.error("invalidateParentElement: Invalid or no element provided");
      return null;
    }
    refreshElement(getClosestParentWithPresenter(element));
  }
  function refreshElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      console.error("refreshElement: Invalid or no element provided");
      return;
    }
    if (!element.webSkelPresenter || typeof element.webSkelPresenter.invalidate !== "function") {
      console.error("refreshElement: Element does not have a webSkelPresenter with an invalidate method");
      return;
    }
    element.webSkelPresenter.invalidate();
  }

  // utils/modal-utils.js
  async function showModal(modalComponentName, componentProps, waitForData) {
    if (typeof componentProps === "boolean") {
      waitForData = componentProps;
      componentProps = void 0;
    }
    const bodyElement = document.querySelector("body");
    const existingModalContainer = getClosestParentElement(bodyElement, "dialog");
    if (existingModalContainer) {
      existingModalContainer.close();
      existingModalContainer.remove();
    }
    const modal = Object.assign(createModal(modalComponentName, componentProps), {
      component: modalComponentName,
      cssClass: modalComponentName,
      componentProps
    });
    bodyElement.appendChild(modal);
    await modal.showModal();
    modal.addEventListener("keydown", preventCloseOnEsc);
    if (waitForData) {
      return new Promise((resolve) => {
        modal.addEventListener("close", (event) => {
          resolve(event.data);
        });
      });
    }
    return modal;
  }
  function preventCloseOnEsc(event) {
    if (event.key === "Escape") {
      event.preventDefault();
    }
  }
  function createModal(childTagName, modalData) {
    let modal = document.createElement("dialog");
    let componentString = "";
    if (modalData !== void 0) {
      Object.keys(modalData).forEach((componentKey) => {
        componentString += ` data-${componentKey}="${modalData[componentKey]}"`;
      });
    }
    let component = webSkel_default.instance.configs.components.find((component2) => component2.name === childTagName);
    if (component.presenterClassName) {
      componentString += ` data-presenter="${childTagName}"`;
    }
    componentString === "" ? modal.innerHTML = `<${childTagName}/>` : modal.innerHTML = `<${childTagName}${componentString}/>`;
    modal.classList.add("modal", `${childTagName}-dialog`);
    return modal;
  }
  function closeModal(element, data) {
    const existingModal = getClosestParentElement(element, "dialog");
    if (data !== void 0) {
      let closeEvent = new Event("close", {
        bubbles: true,
        cancelable: true
      });
      closeEvent.data = data;
      existingModal.dispatchEvent(closeEvent);
    }
    if (existingModal) {
      existingModal.close();
      existingModal.remove();
    }
  }
  function removeActionBox(actionBox, instance) {
    document.removeEventListener("click", actionBox.clickHandler);
    actionBox.remove();
    if (instance !== void 0) {
      delete instance.actionBox;
    }
  }
  async function showActionBox(targetElement, primaryKey, componentName, insertionMode, props = {}) {
    const existingComponentNode = targetElement.parentNode.querySelector(componentName);
    if (existingComponentNode) {
      return null;
    }
    const componentNode = document.createElement(`${componentName}`);
    for (const [key, value] of Object.entries(props)) {
      componentNode.setAttribute(`data-${key}`, value);
    }
    let oldComponentNode;
    switch (insertionMode) {
      case "prepend":
        targetElement.parentNode.insertBefore(componentNode, targetElement);
        break;
      case "append":
        targetElement.parentNode.appendChild(componentNode);
        break;
      case "replace":
        oldComponentNode = targetElement;
        const parentNode = oldComponentNode.parentNode;
        parentNode.removeChild(oldComponentNode);
        parentNode.appendChild(componentNode);
        break;
      case "replace-all":
        oldComponentNode = targetElement.parentNode;
        const parentElement = oldComponentNode;
        oldComponentNode = parentElement.innerHTML;
        parentElement.innerHTML = "";
        parentElement.appendChild(componentNode);
        break;
      default:
        console.error(`Invalid Insertion Mode: ${insertionMode}. No changes to the DOM have been made`);
        return;
    }
    let clickHandler = (event) => {
      if (componentNode && !componentNode.contains(event.target)) {
        if (insertionMode === "replace" && oldComponentNode) {
          const parentNode = componentNode.parentNode;
          parentNode.removeChild(componentNode);
          parentNode.appendChild(oldComponentNode);
        } else if (insertionMode === "replace-all" && oldComponentNode) {
          const parentElement = componentNode.parentNode;
          parentElement.innerHTML = oldComponentNode;
        }
        removeActionBox(componentNode);
      }
    };
    componentNode.clickHandler = clickHandler;
    document.addEventListener("click", clickHandler);
    return componentNode;
  }
  async function createReactiveModal(modalComponentName, componentProps, waitForData = false) {
    if (typeof componentProps === "boolean") {
      waitForData = componentProps;
      componentProps = void 0;
    }
    const bodyElement = document.querySelector("body");
    const existingModalContainer = getClosestParentElement(bodyElement, "dialog");
    if (existingModalContainer) {
      existingModalContainer.close();
      existingModalContainer.remove();
    }
    let modal = document.createElement("dialog");
    modal.classList.add("modal", `${modalComponentName}-dialog`);
    const webSkelInstance = window.WebSkel || assistOS.UI;
    if (!webSkelInstance) {
      throw new Error("WebSkel instance not found for reactive modal");
    }
    let component = webSkelInstance.configs.components.find((component2) => component2.name === modalComponentName);
    const componentProxy = webSkelInstance.createElement(
      modalComponentName,
      modal,
      componentProps || {},
      component?.presenterClassName ? { "data-presenter": modalComponentName } : {},
      true
    );
    Object.assign(modal, {
      component: modalComponentName,
      cssClass: modalComponentName,
      componentProps,
      _componentProxy: componentProxy
    });
    const modalProxy = new Proxy(modal, {
      get(target, prop) {
        if (prop === "props") {
          return componentProxy;
        }
        return Reflect.get(target, prop);
      }
    });
    bodyElement.appendChild(modal);
    await modal.showModal();
    modal.addEventListener("keydown", preventCloseOnEsc);
    if (waitForData) {
      return new Promise((resolve) => {
        modal.addEventListener("close", (event) => {
          resolve(event.data);
        });
      });
    }
    return modalProxy;
  }

  // managers/ResourceManager.js
  var ResourceManager = class {
    constructor() {
      this.loadedStyleSheets = /* @__PURE__ */ new Map();
      this.components = {};
    }
    async loadStyleSheets(styleSheet, identifier) {
      const loadPromises = [];
      loadPromises.push(...styleSheet.map((cssText) => this.loadStyleSheet({
        cssText,
        identifier
      })));
      return (await Promise.all(loadPromises)).join("");
    }
    async loadStyleSheet({ url = null, cssText = null, identifier = null }) {
      if (!url && !cssText) {
        return;
      }
      const key = identifier || url;
      let refCount = this.loadedStyleSheets.get(key) || 0;
      if (refCount === 0) {
        return new Promise((resolve, reject) => {
          try {
            const style = document.createElement("style");
            style.textContent = cssText;
            if (identifier) {
              style.className = identifier;
            }
            document.head.appendChild(style);
            this.loadedStyleSheets.set(key, refCount + 1);
            resolve(style.outerHTML);
          } catch (error) {
            reject(new Error(`Failed to inject the CSS text: ${error.message}`));
          }
        });
      } else {
        this.loadedStyleSheets.set(key, refCount + 1);
      }
    }
    async unloadStyleSheets(identifier) {
      let refCount = this.loadedStyleSheets.get(identifier);
      if (refCount !== void 0) {
        refCount -= 1;
        if (refCount <= 0) {
          this.removeStyleSheet(identifier);
          this.loadedStyleSheets.delete(identifier);
        } else {
          this.loadedStyleSheets.set(identifier, refCount);
        }
      }
    }
    removeStyleSheet(identifier) {
      const styleElements = Array.from(document.head.querySelectorAll(`link[class="${identifier}"], style[class="${identifier}"]`));
      styleElements.forEach((element) => document.head.removeChild(element));
    }
    async loadComponent(component) {
      if (!this.components[component.name]) {
        this.components[component.name] = {
          html: "",
          css: [],
          presenter: null,
          loadingPromise: null,
          isPromiseFulfilled: false
        };
        return this.components[component.name].loadingPromise = (async () => {
          try {
            let componentPath;
            let cssPath;
            if (component.directory) {
              componentPath = `./${webSkel_default.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.html`;
              cssPath = `./${webSkel_default.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.css`;
            } else {
              componentPath = `./${webSkel_default.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.html`;
              cssPath = `./${webSkel_default.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.css`;
            }
            const template = component.loadedTemplate || await (await fetch(componentPath)).text();
            this.components[component.name].html = template;
            const css = component.loadedCSSs || [await (await fetch(cssPath)).text()];
            this.components[component.name].css = css;
            await this.loadStyleSheets(css, component.name);
            if (component.presenterClassName) {
              if (component.presenterModule) {
                this.registerPresenter(component.name, component.presenterModule[component.presenterClassName]);
              } else {
                let presenterPath;
                if (component.directory) {
                  presenterPath = `../../${webSkel_default.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.js`;
                } else {
                  presenterPath = `../../${webSkel_default.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.js`;
                }
                const PresenterModule = await import(presenterPath);
                this.registerPresenter(component.name, PresenterModule[component.presenterClassName]);
              }
            }
            this.components[component.name].isPromiseFulfilled = true;
            return { html: template, css };
          } catch (error) {
            throw error;
          }
        })();
      } else if (!this.components[component.name].isPromiseFulfilled) {
        let result = await this.components[component.name].loadingPromise;
        await this.loadStyleSheets(result.css, component.name);
        return result;
      } else {
        await this.loadStyleSheets(this.components[component.name].css, component.name);
        return {
          html: this.components[component.name].html,
          css: this.components[component.name].css
        };
      }
    }
    registerPresenter(name, presenterClass) {
      this.components[name].presenter = presenterClass;
    }
    initialisePresenter(presenterName, component, invalidate, props = {}) {
      let presenter;
      try {
        presenter = new this.components[component.componentName].presenter(component, invalidate, props);
        component.isPresenterReady = true;
        component.onPresenterReady();
      } catch (e) {
        showApplicationError(`Error creating a presenter instance`, `Encountered an error during the initialization of ${presenterName} for component: ${component.componentName}`, e + ":" + e.stack.split("\n")[1]);
      }
      return presenter;
    }
  };

  // webSkel.js
  var WebSkel = class _WebSkel {
    constructor() {
      this._appContent = {};
      this.appServices = {};
      this._documentElement = document;
      this.actionRegistry = {};
      this.registerListeners();
      this.ResourceManager = new ResourceManager();
      this.defaultLoader = document.createElement("dialog");
      this.loaderCount = 0;
      this.defaultLoader.classList.add("spinner");
      this.defaultLoader.classList.add("spinner-default-style");
      window.showApplicationError = async (title, message, technical) => {
        return await showModal("show-error-modal", {
          title,
          message,
          technical
        });
      };
      console.log("creating new app manager instance");
    }
    static async initialise(configsPath) {
      if (_WebSkel.instance) {
        return _WebSkel.instance;
      }
      let webSkel = new _WebSkel();
      const utilModules = [
        "./utils/dom-utils.js",
        "./utils/form-utils.js",
        "./utils/modal-utils.js",
        "./utils/template-utils.js",
        "./utils/browser-utils.js"
      ];
      for (const path of utilModules) {
        const moduleExports = await import(path);
        for (const [fnName, fn] of Object.entries(moduleExports)) {
          webSkel[fnName] = fn;
        }
      }
      await webSkel.loadConfigs(configsPath);
      _WebSkel.instance = webSkel;
      return _WebSkel.instance;
    }
    async loadConfigs(jsonPath) {
      try {
        const response = await fetch(jsonPath);
        const config = await response.json();
        this.configs = config;
        for (const service of config.services) {
          const ServiceModule = await import(service.path);
          this.initialiseService(ServiceModule[service.name]);
        }
        for (const component of config.components) {
          await this.defineComponent(component);
        }
      } catch (error) {
        console.error(error);
        await showApplicationError("Error loading configs", "Error loading configs", `Encountered ${error} while trying loading webSkel configs`);
      }
    }
    initialiseService(instance) {
      let service = new instance();
      const methodNames = Object.getOwnPropertyNames(instance.prototype).filter((method) => method !== "constructor");
      methodNames.forEach((methodName) => {
        this.appServices[methodName] = service[methodName].bind(service);
      });
    }
    showLoading() {
      let loader = this.defaultLoader.cloneNode(true);
      let id = crypto.randomUUID();
      loader.setAttribute("data-id", id);
      if (this.loaderCount === 0) {
        document.body.appendChild(loader);
        loader.showModal();
      } else {
        this.loaderCount++;
      }
      return id;
    }
    hideLoading(id) {
      if (this.loaderCount > 1) {
        this.loaderCount--;
        return;
      }
      if (id) {
        let loader = document.querySelector(`[data-id = '${id}' ]`);
        if (loader) {
          loader.close();
          loader.remove();
        }
      } else {
        let loaderElements = document.querySelectorAll(".spinner");
        loaderElements.forEach((loader) => {
          loader.close();
          loader.remove();
        });
      }
    }
    setLoading(stringHTML) {
      this.defaultLoader.innerHTML = stringHTML;
      this.defaultLoader.classList.remove("spinner-default-style");
    }
    resetLoading() {
      this.defaultLoader = document.createElement("dialog");
      this.defaultLoader.classList.add("spinner");
      this.defaultLoader.classList.add("spinner-default-style");
    }
    async changeToDynamicPage(pageHtmlTagName, url, dataPresenterParams, skipHistoryState) {
      try {
        this.validateTagName(pageHtmlTagName);
      } catch (e) {
        showApplicationError(e, e, e);
        console.error(e);
        return;
      }
      const id = this.showLoading();
      let attributesStringPresenter = "";
      if (dataPresenterParams)
        attributesStringPresenter = Object.entries(dataPresenterParams).map(([key, value]) => `data-${key}="${value}"`).join(" ");
      try {
        const result = `<${pageHtmlTagName} data-presenter="${pageHtmlTagName}" ${attributesStringPresenter}></${pageHtmlTagName}>`;
        if (!skipHistoryState) {
          const path = ["#", url].join("");
          window.history.pushState({ pageHtmlTagName, relativeUrlContent: result }, path.toString(), path);
        }
        this.updateAppContent(result);
      } catch (error) {
        console.error("Failed to change page", error);
      } finally {
        this.hideLoading(id);
      }
    }
    validateTagName(tagName) {
      let regex = /^(?![0-9])[a-z0-9]+(?:-*[a-z0-9]+)*-*?$/;
      if (!regex.test(tagName)) {
        throw new Error(`Invalid tag name: ${tagName}`);
      }
      let element = this.configs.components.find((element2) => element2.name === tagName);
      if (!element) {
        throw new Error(`Element not found in configs: ${tagName}`);
      }
    }
    async changeToStaticPage(pageUrl, skipHistoryState) {
      const loadingId = this.showLoading();
      try {
        const pageContent = await this.fetchTextResult(pageUrl, skipHistoryState);
        this.updateAppContent(pageContent);
      } catch (error) {
        console.log("Failed to change page", error);
      } finally {
        this.hideLoading(loadingId);
      }
    }
    async interceptAppContentLinks(e) {
      let target = e.target || e.srcElement;
      if (target.hasAttribute("data-page")) {
        let pageName = target.getAttribute("data-page");
        e.preventDefault();
        return await this.changeToDynamicPage(pageName);
      }
      if (target.hasAttribute("data-path")) {
        let pageName = target.getAttribute("data-path");
        e.preventDefault();
        return await this.changeToStaticPage(pageName);
      }
    }
    setDomElementForPages(elem) {
      this._appContent = elem;
    }
    updateAppContent(content) {
      try {
        this.preventExternalResources(content);
      } catch (e) {
        showApplicationError(e, e, e);
        console.error(e);
        return;
      }
      this._appContent.innerHTML = content;
    }
    preventExternalResources(content) {
      let regex = /(src|href|action|onclick)\s*=\s*"[^"]*"/g;
      let matches = content.match(regex);
      if (matches) {
        for (let match of matches) {
          let url = match.split('"')[1];
          let linkDomain = new URL(url).host;
          if (window.location.host !== linkDomain) {
            throw new Error(`External resource detected: ${url}`);
          }
        }
      }
    }
    registerListeners() {
      this._documentElement.addEventListener("click", this.interceptAppContentLinks.bind(this));
      window.onpopstate = (e) => {
        if (e.state && e.state.relativeUrlContent) {
          this.updateAppContent(e.state.relativeUrlContent);
        }
      };
      this._documentElement.addEventListener("click", async (event) => {
        let target = event.target;
        let stopPropagation = false;
        while (target && target !== this._documentElement && !stopPropagation) {
          if (target.hasAttribute("data-local-action")) {
            event.preventDefault();
            event.stopPropagation();
            stopPropagation = true;
            let currentCustomElement = target;
            let actionHandled = false;
            const action = target.getAttribute("data-local-action");
            const [actionName, ...actionParams] = action.split(" ");
            while (actionHandled === false) {
              let presenterFound = false;
              let p;
              while (presenterFound === false) {
                if (currentCustomElement.webSkelPresenter) {
                  presenterFound = true;
                  p = currentCustomElement.webSkelPresenter;
                  break;
                }
                currentCustomElement = currentCustomElement.parentElement;
                if (currentCustomElement === document) {
                  await showApplicationError("Error executing action", "Action not found in any Presenter", "Action not found in any Presenter");
                  return;
                }
              }
              if (p[actionName] !== void 0) {
                try {
                  currentCustomElement.webSkelPresenter[actionName](target, ...actionParams);
                  actionHandled = true;
                } catch (error) {
                  console.error(error);
                  await showApplicationError("Error executing action", "There is no action for the button to execute", `Encountered ${error}`);
                  return;
                }
              } else {
                presenterFound = false;
                currentCustomElement = currentCustomElement.parentElement;
              }
            }
          } else {
            if (target.hasAttribute("data-action")) {
              event.preventDefault();
              event.stopPropagation();
              stopPropagation = true;
              const action = target.getAttribute("data-action");
              const [actionName, ...actionParams] = action.split(" ");
              if (actionName) {
                this.callAction(actionName, target, ...actionParams);
              } else {
                console.error(`${target} : data action attribute value should not be empty!`);
              }
              break;
            }
          }
          target = target.parentElement;
        }
      });
    }
    registerAction(actionName, actionHandler) {
      this.actionRegistry[actionName] = actionHandler;
    }
    callAction(actionName, ...params) {
      const actionHandler = this.actionRegistry[actionName];
      if (!actionHandler) {
        throw new Error(`No action handler registered for "${actionName}"`);
      }
      let thisCall = params && params[0] instanceof HTMLElement ? params[0] : null;
      actionHandler.call(thisCall, ...params);
    }
    async fetchTextResult(relativeUrlPath, skipHistoryState) {
      const appBaseUrl = new URL(`${window.location.protocol}//${window.location.host}`);
      if (relativeUrlPath.startsWith("#")) {
        relativeUrlPath = relativeUrlPath.slice(1);
      }
      console.log("Fetching Data from URL: ", appBaseUrl + relativeUrlPath);
      const response = await fetch(appBaseUrl + relativeUrlPath);
      if (!response.ok) {
        throw new Error("Failed to execute request");
      }
      const result = await response.text();
      if (!skipHistoryState) {
        const path = appBaseUrl + "#" + relativeUrlPath;
        window.history.pushState({ relativeUrlPath, relativeUrlContent: result }, path.toString(), path);
      }
      return result;
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
    createElement(elementName, location = null, props = {}, attributes = {}, observeProps = false) {
      const element = document.createElement(elementName);
      const { proxy: propsProxy, revoke } = this.createReactiveProxy(props, observeProps, element);
      element.setAttribute("data-presenter", elementName);
      const handler = {
        get(target, prop, receiver) {
          if (prop === "element") {
            return new WeakRef(element);
          }
          if (prop in propsProxy) {
            return Reflect.get(propsProxy, prop, receiver);
          }
          if (prop in element) {
            const value = element[prop];
            return typeof value === "function" ? value.bind(element) : value;
          }
          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          if (prop === "element") {
            return false;
          }
          if (prop in propsProxy) {
            return Reflect.set(propsProxy, prop, value, receiver);
          }
          if (prop in element) {
            element[prop] = value;
            return true;
          }
          return Reflect.set(propsProxy, prop, value, receiver);
        },
        has(target, prop) {
          return prop === "element" || prop in propsProxy || prop in element;
        },
        ownKeys(target) {
          const propsKeys = Reflect.ownKeys(propsProxy);
          const elementKeys = Reflect.ownKeys(element);
          return [.../* @__PURE__ */ new Set([...propsKeys, ...elementKeys, "element"])];
        },
        getOwnPropertyDescriptor(target, prop) {
          if (prop === "element") {
            return {
              value: new WeakRef(element),
              writable: false,
              enumerable: true,
              configurable: false
            };
          }
          if (prop in propsProxy) {
            return Reflect.getOwnPropertyDescriptor(propsProxy, prop);
          }
          if (prop in element) {
            return Reflect.getOwnPropertyDescriptor(element, prop);
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        }
      };
      const combinedProxy = new Proxy({}, handler);
      element._webSkelProps = {
        raw: props,
        proxy: propsProxy,
        revoke,
        observeProps
      };
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      if (location instanceof HTMLElement) {
        location?.appendChild(element);
      } else if (typeof location === "string") {
        document.querySelector(location)?.appendChild(element);
      } else if (location === null) {
      }
      return combinedProxy;
    }
    /**
     * Creates a reactive proxy for an object that triggers an element invalidation on property changes.
     * @param {Object} target - The target object to wrap in a reactive proxy.
     * @param {boolean} observe - If true, nested objects are also wrapped in reactive proxies.
     * @param {HTMLElement} element - The element whose invalidate method is called on property changes.
     * @returns {{proxy: Proxy, revoke: Function}} An object containing the reactive proxy and a revoke function.
     */
    createReactiveProxy(target, observe, element) {
      const revokers = /* @__PURE__ */ new Set();
      const handler = {
        set(obj, prop, value) {
          if (observe && typeof value === "object" && value !== null) {
            value = this.createReactiveProxy(value, observe, element).proxy;
          }
          const oldValue = obj[prop];
          obj[prop] = value;
          if (!Object.is(oldValue, value)) {
            element.invalidateProxy?.();
          }
          return true;
        },
        deleteProperty(obj, prop) {
          delete obj[prop];
          element.invalidateProxy?.();
          return true;
        }
      };
      const { proxy, revoke } = Proxy.revocable(target, handler);
      if (observe) {
        for (const key in target) {
          if (typeof target[key] === "object" && target[key] !== null) {
            target[key] = this.createReactiveProxy(target[key], observe, element).proxy;
          }
        }
      }
      return { proxy, revoke };
    }
    defineComponent = async (component) => {
      if (!customElements.get(component.name)) {
        customElements.define(
          component.name,
          class extends HTMLElement {
            constructor() {
              super();
              this.variables = {};
              this.componentName = component.name;
              this.props = {};
              this.presenterReadyPromise = new Promise((resolve) => {
                this.onPresenterReady = resolve;
              });
              this.isPresenterReady = false;
            }
            invalidateProxy() {
              if (this.invalidateFn) {
                this.invalidateFn();
              }
            }
            async connectedCallback() {
              if (this._webSkelProps) {
                this.props = this._webSkelProps.proxy;
              }
              this.resources = await _WebSkel.instance.ResourceManager.loadComponent(component);
              let vars = findDoubleDollarWords(this.resources.html);
              vars.forEach((vn) => {
                vn = vn.slice(2);
                this.variables[vn] = "";
              });
              this.templateArray = createTemplateArray(this.resources.html);
              let self = this;
              let presenter = null;
              for (const attr of self.attributes) {
                self.variables[attr.nodeName] = sanitize(attr.nodeValue);
                if (attr.name === "data-presenter") {
                  presenter = attr.nodeValue;
                }
              }
              if (presenter) {
                const invalidate = async (loadDataAsyncFunction) => {
                  const displayError = (e) => {
                    self.innerHTML = `Error rendering component: ${self.componentName}
: ` + e + e.stack.split("\n")[1];
                    console.error(e);
                    _WebSkel.instance.hideLoading();
                  };
                  const renderPage = async () => {
                    try {
                      await self.webSkelPresenter.beforeRender();
                      for (let vn in self.variables) {
                        if (typeof self.webSkelPresenter[vn] !== "undefined") {
                          self.variables[vn] = self.webSkelPresenter[vn];
                        }
                      }
                      self.refresh();
                      await self.webSkelPresenter.afterRender?.();
                    } catch (e) {
                      displayError(e);
                    }
                  };
                  _WebSkel.instance.showLoading();
                  if (loadDataAsyncFunction) {
                    try {
                      await loadDataAsyncFunction();
                    } catch (error) {
                      return displayError(error);
                    }
                  }
                  await renderPage();
                  _WebSkel.instance.hideLoading();
                };
                const invalidateProxy = new Proxy(invalidate, {
                  apply: async function(target, thisArg, argumentsList) {
                    if (!self.isPresenterReady) {
                      await self.presenterReadyPromise;
                    }
                    return Reflect.apply(target, thisArg, argumentsList);
                  }
                });
                self.invalidateFn = invalidateProxy;
                self.webSkelPresenter = _WebSkel.instance.ResourceManager.initialisePresenter(presenter, self, invalidateProxy, this.props);
              } else {
                self.refresh();
              }
            }
            async disconnectedCallback() {
              this._webSkelProps?.revoke();
              if (this.webSkelPresenter) {
                if (this.webSkelPresenter.afterUnload) {
                  await this.webSkelPresenter.afterUnload();
                }
              }
              if (this.resources) {
                if (this.resources.css) {
                  await _WebSkel.instance.ResourceManager.unloadStyleSheets(this.componentName);
                }
              }
            }
            refresh() {
              let stringHTML = "";
              for (let item of this.templateArray) {
                item.startsWith("$$") ? stringHTML += this.variables[item.slice(2)] : stringHTML += item;
              }
              this.innerHTML = stringHTML;
            }
          }
        );
      }
    };
  };
  var webSkel_default = WebSkel;

  // utils/browser-utils.js
  var browser_utils_exports = {};
  __export(browser_utils_exports, {
    getBrowser: () => getBrowser,
    getHashParams: () => getHashParams,
    getURLParams: () => getURLParams
  });
  function getBrowser() {
    let userAgent = navigator.userAgent, tem, M = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
      return { name: "IE", version: tem[1] || "" };
    }
    if (M[1] === "Chrome") {
      tem = userAgent.match(/\bOPR|Edge\/(\d+)/);
      if (tem != null) {
        return { name: "Opera", version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = userAgent.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1]
    };
  }
  function getURLParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let result = {};
    for (let key of urlParams.keys()) {
      result[key] = urlParams.get(key);
    }
    return result;
  }
  function getHashParams() {
    const urlSplitArr = window.location.hash.split("?");
    let params = {};
    if (urlSplitArr[1]) {
      const hashParams = new URLSearchParams(urlSplitArr[1]);
      for (const [key, value] of hashParams) {
        params[key] = value;
      }
      return params;
    }
    return params;
  }

  // utils/form-utils.js
  var form_utils_exports = {};
  __export(form_utils_exports, {
    extractFormInformation: () => extractFormInformation,
    imageUpload: () => imageUpload,
    uploadFileAsText: () => uploadFileAsText
  });
  async function extractFormInformation(element, conditions) {
    const form = getClosestParentElement(element, "form");
    const formData = {
      data: {},
      elements: {},
      isValid: false
    };
    if (typeof form.checkValidity === "function") {
      formData.isValid = form.checkValidity();
    }
    const namedElements = [...form.querySelectorAll("[name]:not([type=hidden])")];
    for (const element2 of namedElements) {
      if (element2.disabled) {
        continue;
      }
      if (element2.multiple && element2.tagName === "SELECT") {
        formData.data[element2.name] = Array.from(element2.selectedOptions).map((option) => option.value);
      } else {
        formData.data[element2.name] = element2.tagName === "CHECKBOX" || element2.tagName === "INPUT" && element2.type === "checkbox" ? element2.checked : element2.value;
      }
      if (element2.getAttribute("type") === "file") {
        if (element2.multiple) {
          formData.data[element2.name] = element2.files;
        } else {
          try {
            if (element2.files.length > 0) {
              formData.data[element2.name] = await imageUpload(element2.files[0]);
            }
          } catch (err) {
            console.log(err);
          }
        }
      }
      let isValid = true;
      element2.setCustomValidity("");
      if (typeof element2.checkValidity === "function") {
        isValid = element2.checkValidity();
      } else if (typeof element2.getInputElement === "function") {
        const inputElement = await element2.getInputElement();
        isValid = inputElement.checkValidity();
      }
      if (isValid === true) {
        if (conditions) {
          let conditionFunctionName = element2.getAttribute("data-condition");
          if (conditionFunctionName) {
            isValid = conditions[conditionFunctionName].fn(element2, formData);
            if (isValid) {
              element2.setCustomValidity("");
            } else {
              element2.setCustomValidity(conditions[conditionFunctionName].errorMessage);
              formData.isValid = false;
            }
          }
        }
      }
      formData.elements[element2.name] = {
        isValid,
        element: element2
      };
      let inputBorderElem = document.querySelector(`[data-id = '${element2.getAttribute("id")}' ]`);
      if (inputBorderElem) {
        if (!isValid) {
          inputBorderElem.classList.add("input-invalid");
        } else {
          inputBorderElem.classList.remove("input-invalid");
        }
      }
    }
    if (!form.checkValidity()) {
      form.reportValidity();
    }
    for (let key of Object.keys(formData.data)) {
      if (formData.elements[key] && formData.elements[key].element && formData.elements[key].element.hasAttribute("data-no-sanitize")) {
        continue;
      }
      formData.data[key] = sanitize(formData.data[key]);
    }
    return formData;
  }
  async function imageUpload(file) {
    let base64String = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onload = function() {
        base64String = reader.result;
        resolve(base64String);
      };
      if (file) {
        reader.readAsDataURL(file);
      } else {
        reject("No file given as input at imageUpload");
      }
    });
  }
  async function uploadFileAsText(file) {
    let string = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onload = function() {
        string = reader.result;
        resolve(string);
      };
      if (file) {
        reader.readAsText(file);
      } else {
        reject("No file given as input");
      }
    });
  }

  // bundle-entry.js
  var utils = {
    browserUtils: browser_utils_exports,
    domUtils: dom_utils_exports,
    formUtils: form_utils_exports,
    modalUtils: modal_utils_exports,
    templateUtils: template_utils_exports
  };
  var originalInitialise = webSkel_default.initialise;
  webSkel_default.initialise = async function(configsPath) {
    if (webSkel_default.instance) {
      return webSkel_default.instance;
    }
    let webSkel = new webSkel_default();
    for (const utilBundle of Object.values(utils)) {
      for (const [fnName, fn] of Object.entries(utilBundle)) {
        webSkel[fnName] = fn;
      }
    }
    await webSkel.loadConfigs(configsPath);
    webSkel_default.instance = webSkel;
    return webSkel_default.instance;
  };
  var bundle_entry_default = webSkel_default;
  if (typeof globalThis !== "undefined") {
    globalThis.WebSkel = webSkel_default;
  }
  return __toCommonJS(bundle_entry_exports);
})();
