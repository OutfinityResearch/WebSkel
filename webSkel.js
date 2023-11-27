import {findDoubleDollarWords, createTemplateArray} from "./utils/template-utils.js";
import {showModal} from "./utils/modal-utils.js";
import {StylesheetsService} from "./services/stylesheetsService.js";

class WebSkel {
    constructor() {
        this._appContent = {};
        this.presentersRegistry = {};
        this.servicesRegistry = {};
        this._documentElement = document;
        this.actionRegistry = {};
        this.registerListeners();
        this.StyleSheetsService = new StylesheetsService();
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
            showApplicationError(`No presenter ${presenterName} found.`, `No presenter ${presenterName} found.`, `No presenter ${presenterName} found.`);
            console.log(`No presenter ${presenterName} found. ${e}`);
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
                    while (currentCustomElement.webSkelPresenter === undefined) {
                        currentCustomElement = currentCustomElement.parentElement;
                        if (currentCustomElement === document) {
                            currentCustomElement = undefined;
                            break;
                        }
                    }
                    if (currentCustomElement !== undefined) {
                        const action = target.getAttribute("data-local-action");
                        const [actionName, ...actionParams] = action.split(" ");
                        let p = currentCustomElement.webSkelPresenter;
                        p = Object.getPrototypeOf(p);
                        if (p[actionName] === undefined) {
                            await showApplicationError("Button has no Action", "There is no action for the button to execute", `Presenter missing ${actionName} method`);
                            console.error("No action for the button to execute");
                        } else {
                            try {
                                currentCustomElement.webSkelPresenter[actionName](target, ...actionParams);
                            } catch (error) {
                                console.error(error);
                                await showApplicationError("Error executing action", "There is no action for the button to execute", `Encountered ${error}`);
                            }
                        }
                    } else {
                        console.error("No presenter found for the button");
                        await showApplicationError("Missing Presenter", "Encountered an error while executing action", "No presenter found for the button");
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

    defineComponent = async (componentName, templatePath, cssPaths) => {
        let template = await (await fetch(templatePath)).text();
        customElements.define(
            componentName,
            class extends HTMLElement {
                constructor() {
                    super();
                    this.variables = {};
                    this.cssPaths = cssPaths || null;
                    let vars = findDoubleDollarWords(template);
                    vars.forEach((vn) => {
                        vn = vn.slice(2);
                        this.variables[vn] = "";
                    });
                    this.templateArray = createTemplateArray(template);
                }

                async connectedCallback() {
                    if (this.cssPaths) {
                        await webSkel.StyleSheetsService.loadStyleSheets(cssPaths);
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
                                    self.webSkelPresenter.afterRender?.();
                                }, 0);
                            }
                            self.webSkelPresenter = window.webSkel.initialisePresenter(attr.nodeValue, self, invalidate);
                            self.webSkelPresenter.invalidate = invalidate;
                        }

                    });
                    if (!self.webSkelPresenter) {
                        self.refresh();
                    }
                }

                async disconnectedCallback() {
                    if (this.cssPaths) {
                        await webSkel.StyleSheetsService.unloadStyleSheets(this.cssPaths);
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
    };
}

export default WebSkel;