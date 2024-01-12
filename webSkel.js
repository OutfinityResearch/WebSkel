import {findDoubleDollarWords, createTemplateArray} from "./utils/template-utils.js";
import {showModal} from "./utils/modal-utils.js";
import {StylesheetsService} from "./services/stylesheetsService.js";
import {UtilsService} from "./services/utilsService.js";

class WebSkel {
    constructor() {
        this._appContent = {};
        this.presentersRegistry = {};
        this.servicesRegistry = {};
        this._documentElement = document;
        this.actionRegistry = {};
        this.registerListeners();
        this.StyleSheetsService = new StylesheetsService();
        this.UtilsService = new UtilsService();
        window.showApplicationError = async (title, message, technical) => {
            await showModal(webSkel._appContent, "show-error-modal", {
                presenter: "show-error-modal",
                title: title,
                message: message,
                technical: technical
            });
        }
        console.log("creating new app manager instance");
    }

    registerPresenter(name, instance) {
        this.presentersRegistry[name] = instance;
    }

    initialisePresenter(presenterName, component, invalidate) {
        let presenter;
        try {
            presenter = new this.presentersRegistry[presenterName](component, invalidate);
        } catch (e) {
            showApplicationError(`Error creating a presenter instance`, `Encountered an error during the initialization of ${presenterName} for component ${component}`, `${e}`);
            return undefined;
        }
        return presenter;
    }

    initialiseService(serviceName, instance) {
        this.servicesRegistry[serviceName] = new instance;
    }

    getService(name) {
        return this.servicesRegistry[name];
    }

    async showLoading(element) {
        const loading = document.createElement("dialog");
        if (!element) {
            loading.classList.add("spinner");
        } else {
            loading.insertAdjacentHTML("afterbegin", element);
        }
        document.body.appendChild(loading);
        await loading.showModal();
        return loading;
    }

    /* without server request */
    async changeToDynamicPage(pageHtmlTagName, url, dataPresenterParams, skipHistoryState) {
        const loading = await this.showLoading();
        let attributesStringPresenter = '';
        if (!this.presentersRegistry.hasOwnProperty(pageHtmlTagName)) {
            await showApplicationError("Page doesn't exist!", `Page '${pageHtmlTagName}' doesn't exist!`, `Page with presenter name: '${pageHtmlTagName}' doesn't exist in presenterRegistry`);
            loading.close();
            loading.remove();
            return
        }
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

    defineComponent = async (componentName, templatePath, cssPaths, appComponent) => {
        if (!customElements.get(componentName)) {
            let template = "";
            appComponent ? template = templatePath : template = await (await fetch(templatePath)).text();
            customElements.define(
                componentName,
                class extends HTMLElement {
                    constructor() {
                        super();
                        this.variables = {};
                        this.cssPaths = cssPaths || null;
                        this.appComponent = appComponent || null;
                        let vars = findDoubleDollarWords(template);
                        vars.forEach((vn) => {
                            vn = vn.slice(2);
                            this.variables[vn] = "";
                        });
                        this.templateArray = createTemplateArray(template);
                    }

                    async connectedCallback() {
                        if (this.cssPaths) {
                            await webSkel.StyleSheetsService.loadStyleSheets(cssPaths, this.appComponent);
                        }
                        let self = this;
                        Array.from(self.attributes).forEach((attr) => {
                            if (typeof self.variables[attr.nodeName]) {
                                self.variables[attr.nodeName] = attr.nodeValue;
                            }
                            if (attr.name === "data-presenter") {
                                const invalidate = () => {
                                    setTimeout(() => {
                                        self.webSkelPresenter.beforeRender();
                                        for (let vn in self.variables) {
                                            if (typeof self.webSkelPresenter[vn] !== "undefined") {
                                                self.variables[vn] = self.webSkelPresenter[vn];
                                            }
                                        }
                                        self.refresh();
                                        /* Temporary quick-fix for fixing other issues - To Be Replaced
                                        * La runtime in  afterRender-ul componentei web parinte, componenta web copil nu are inca HTML-ul incarcat
                                        * si nu se pot face operatii legate de HTML-ul ei
                                        * nu a fost testat la mult nesting de componente web
                                        */
                                        setTimeout(() => {
                                            self.webSkelPresenter.afterRender?.()
                                        }, 0);
                                    }, 0);
                                }
                                self.webSkelPresenter = webSkel.initialisePresenter(attr.nodeValue, self, invalidate);
                            }
                        });
                        if (!self.webSkelPresenter) {
                            self.refresh();
                        }
                    }

                    async disconnectedCallback() {
                        if (this.cssPaths) {
                            await webSkel.StyleSheetsService.unloadStyleSheets(this.cssPaths, this.appComponent);
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