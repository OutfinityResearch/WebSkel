import {appBaseUrl, getApihubUrl, isInternalUrl} from "./utils/url-utils.js";

class AppManager {
    constructor() {
        this.presentersRegistry = {};
        this._documentElement = document;
        this.actionRegistry = {};
        this.registerListeners();
        console.log("creating new app manager instance");
    }

    registerPresenter(name, instance) {
        this.presentersRegistry[name] = instance;
    }

    initialisePresenter(presenterName) {
        let presenter;
        try {
            presenter = new this.presentersRegistry[presenterName];
        } catch(e) {
            console.error(`No presenter ${presenterName} found.`);
        }
        return presenter;
    }

    async showLoading() {
        const loading = document.createElement("dialog");
        loading.classList.add("spinner");
        // loading.duration = 2000;

        document.body.appendChild(loading);
        await loading.showModal();
        return loading;
    }

    async changeToDynamicPage(pageHtmlTagName, skipHistoryState) {
        let result = `<${pageHtmlTagName} data-presenter="${pageHtmlTagName}"></${pageHtmlTagName}>`;
        if (!skipHistoryState) {
            const path = appBaseUrl + "#" + pageHtmlTagName; // leave baseUrl for now
            window.history.pushState({ pageHtmlTagName, relativeUrlContent: result }, path.toString(), path);
        }
        this.updateAppContent(result);
    }

    async changeToStaticPage(pageUrl, skipHistoryState) {
        const loading= await this.showLoading();
        try {
            const pageContent = this.fetchTextResult(pageUrl, skipHistoryState);
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
        this._appContent.innerHTML = elem;
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
        this._documentElement.addEventListener("click", (event) => {
            let target= event.target;

            while (target && target !== this._documentElement) {
                if (target.hasAttribute("data-action")) {
                    event.preventDefault(); // Cancel the native event
                    event.stopPropagation(); // Don't bubble/capture the event any further

                    const action = target.getAttribute("data-action");
                    const [actionName, ...actionParams] = action.split(" ");

                    if (actionName) {
                        this.callAction(actionName,target,...actionParams);
                    }
                    else {
                        console.error(`${target} : data action attribute value should not be empty!`);
                    }
                    break;
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
        if(relativeUrlPath.startsWith("#")) {
            relativeUrlPath=relativeUrlPath.slice(1);
        }
        const response = await fetch(appBaseUrl + '/' + relativeUrlPath);
        if (!response.ok) {
            throw new Error("Failed to execute request");
        }

        const result = await response.text();

        if (!skipHistoryState) {
            // const path = new URL(relativeUrlPath, baseUrl);
            const path = appBaseUrl + "#" + relativeUrlPath; // leave baseUrl for now
            window.history.pushState({ relativeUrlPath, relativeUrlContent: result }, path.toString(), path);
        }
        return result;
    }
}

export default AppManager;