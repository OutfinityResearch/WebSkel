import {createTemplateArray, findDoubleDollarWords} from "./utils/template-utils.js";
import {showModal} from "./utils/modal-utils.js";
import {ResourceManager} from "./managers/ResourceManager.js";

class WebSkel {
    constructor() {
        this._appContent = {};
        this.appServices = {};
        this._documentElement = document;
        this.actionRegistry = {};
        this.registerListeners();
        this.ResourceManager = new ResourceManager();
        this.defaultLoader = document.createElement("dialog");
        this.defaultLoader.classList.add("spinner");
        this.defaultLoader.classList.add("spinner-default-style");
        window.showApplicationError = async (title, message, technical) => {
            await showModal("show-error-modal", {
                title: title,
                message: message,
                technical: technical
            });
        }
        console.log("creating new app manager instance");
    }
    static async initialise(configsPath, lazyLoading){
        let webSkel = new WebSkel();
        webSkel.lazyLoading = lazyLoading;
        const utilModules = [
           './utils/dom-utils.js',
            './utils/form-utils.js',
            './utils/modal-utils.js',
            './utils/template-utils.js',
            './utils/browser-utils.js'
        ];
        for (const  path of utilModules) {
            const moduleExports = await import(path);
            for (const [fnName, fn] of Object.entries(moduleExports)) {
                webSkel[fnName] = fn;
            }
        }
        await webSkel.loadConfigs(configsPath);
        return webSkel;
    }
    async loadConfigs(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            const config = await response.json();
            this.configs = config;
            for (const service of config.services) {
                const ServiceModule = await import(service.path);
                this.initialiseService(service.name, ServiceModule[service.name]);
            }
            for (const component of config.components) {
                await this.defineComponent(component);
            }
        } catch (error) {
            console.error(error);
            await showApplicationError("Error loading configs", "Error loading configs", `Encountered ${error} while trying loading webSkel configs`);
        }
    }




    initialiseService(serviceName, instance) {
        let service = new instance;
        const methodNames = Object.getOwnPropertyNames(instance.prototype)
            .filter(method => method !== 'constructor');
        methodNames.forEach(methodName => {
            this.appServices[methodName] = service[methodName].bind(service);
        });
    }

    async showLoading() {
        document.body.appendChild(this.defaultLoader);
        await this.defaultLoader.showModal();
        return this.defaultLoader;
    }
    setLoading(stringHTML){
        this.defaultLoader.innerHTML = stringHTML;
        this.defaultLoader.classList.remove("spinner-default-style");
    }
    resetLoading(){
        this.defaultLoader = document.createElement("dialog");
        this.defaultLoader.classList.add("spinner");
        this.defaultLoader.classList.add("spinner-default-style");
    }

    hideLoading() {
      let loaderElements = document.querySelectorAll(".spinner");
      loaderElements.forEach(loader => {
        loader.close();
        loader.remove();
      })
    }


    /* without server request */
    async changeToDynamicPage(pageHtmlTagName, url, dataPresenterParams, skipHistoryState) {
        const loading = await this.showLoading();
        let attributesStringPresenter = '';
        // if (!this.presentersRegistry.hasOwnProperty(pageHtmlTagName)) {
        //     await showApplicationError("Page doesn't exist!", `Page '${pageHtmlTagName}' doesn't exist!`, `Page with presenter name: '${pageHtmlTagName}' doesn't exist in presenterRegistry`);
        //     loading.close();
        //     loading.remove();
        //     return;
        // }
        if (dataPresenterParams)
            attributesStringPresenter = Object.entries(dataPresenterParams).map(([key, value]) => `data-${key}="${value}"`).join(' ');
        try {
            const result = `<${pageHtmlTagName} data-presenter="${pageHtmlTagName}" ${attributesStringPresenter}></${pageHtmlTagName}>`;
            if (!skipHistoryState) {
                const path = ["#", url].join("");
                window.history.pushState({pageHtmlTagName, relativeUrlContent: result}, path.toString(), path);
            }
            this.updateAppContent(result);
        } catch (error) {
            console.log("Failed to change page", error);
        } finally {
            loading.close();
            loading.remove();
        }
    }

    /* with server request */
    async changeToStaticPage(pageUrl, skipHistoryState) {
        const loading = await this.showLoading();
        try {
            const pageContent = await this.fetchTextResult(pageUrl, skipHistoryState);
            this.updateAppContent(pageContent);
        } catch (error) {
            console.log("Failed to change page", error);
        } finally {
            loading.close();
            loading.remove();
        }
    }

    async interceptAppContentLinks(e) {
        let target = e.target || e.srcElement;
        /*
            Examples:
            <a data-page="llm-page 1234"> LLM Page </a>
            <a data-path="/default/posts/1234"></a>
         */
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
        this._appContent.innerHTML = content;
    }

    registerListeners() {
        this._documentElement.addEventListener("click", this.interceptAppContentLinks.bind(this));
        window.onpopstate = (e) => {
            if (e.state && e.state.relativeUrlContent) {
                this.updateAppContent(e.state.relativeUrlContent);
            }
        };

        // register listener for data-action attribute
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
                        /* Urcam in Arborele DOM si cautam un element care are webSkelPresenter */
                        while (currentCustomElement !== document && presenterFound === false) {
                            currentCustomElement = currentCustomElement.parentElement;
                            if (currentCustomElement === document) {
                                await showApplicationError("Error executing action", "Action not found in any Presenter", "Action not found in any Presenter");
                                return;
                            }
                            if (currentCustomElement.webSkelPresenter) {
                                presenterFound = true;
                            }
                        }
                        let p = currentCustomElement.webSkelPresenter;
                        p = Object.getPrototypeOf(p);
                        if (p[actionName] !== undefined) {
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
                        }
                    }
                } else {
                    if (target.hasAttribute("data-action")) {
                        event.preventDefault(); // Cancel the native event
                        event.stopPropagation(); // Don't bubble/capture the event any further
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
        /* Sending request to server */
        const response = await fetch(appBaseUrl + relativeUrlPath);
        if (!response.ok) {
            throw new Error("Failed to execute request");
        }
        const result = await response.text();
        if (!skipHistoryState) {
            const path = appBaseUrl + "#" + relativeUrlPath; // leave baseUrl for now
            window.history.pushState({relativeUrlPath, relativeUrlContent: result}, path.toString(), path);
        }
        return result;
    }

    defineComponent = async (component, loadedTemplate, cssData) => {
        if (!customElements.get(component.name)) {
            customElements.define(
                component.name,
                class extends HTMLElement {
                    constructor() {
                        super();
                        this.variables = {};
                        this.componentName = component.name;
                    }

                    async connectedCallback() {
                        this.resources = await webSkel.ResourceManager.loadComponent(component, loadedTemplate, cssData);
                        let vars = findDoubleDollarWords(this.resources.html);
                        vars.forEach((vn) => {
                            vn = vn.slice(2);
                            this.variables[vn] = "";
                        });
                        this.templateArray = createTemplateArray(this.resources.html);

                        let self = this;
                        Array.from(self.attributes).forEach((attr) => {
                            if (typeof self.variables[attr.nodeName]) {
                                self.variables[attr.nodeName] = attr.nodeValue;
                            }
                            if (attr.name === "data-presenter") {
                                const invalidate = (loadDataAsyncFunction) => {
                                    const renderPage = ()=>{
                                        requestAnimationFrame( () => {
                                            self.webSkelPresenter.beforeRender();
                                            for (let vn in self.variables) {
                                                if (typeof self.webSkelPresenter[vn] !== "undefined") {
                                                    self.variables[vn] = self.webSkelPresenter[vn];
                                                }
                                            }
                                            self.refresh();
                                            requestAnimationFrame(() => {
                                                self.webSkelPresenter.afterRender?.();
                                                webSkel.hideLoading();
                                            });
                                        });
                                    };
                                    if(loadDataAsyncFunction){
                                        webSkel.showLoading().then(()=>{
                                            loadDataAsyncFunction().then(()=>{
                                                renderPage();
                                            });
                                        });
                                    }else {
                                       renderPage();
                                    }
                                }
                                self.webSkelPresenter = webSkel.ResourceManager.initialisePresenter(attr.nodeValue, self, invalidate);
                            }
                        });
                        if (!self.webSkelPresenter) {
                            await self.refresh();
                        }
                    }

                    async disconnectedCallback() {
                        if (this.resources.css) {
                            await webSkel.ResourceManager.unloadStyleSheets(this.componentName);
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
    }
}

export default WebSkel;
