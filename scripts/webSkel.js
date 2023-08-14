import AppManager from "./app-manager.js";
import { closeModal, showModal } from "./utils/modal-utils.js";
import { getAppUrl } from "./utils/url-utils.js";
import {createTemplateArray, findDoubleDollarWords} from "./utils/template-utils.js"

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}
const defineComponent = async (componentName, templatePath) => {
    let template = await (await fetch(getAppUrl(templatePath))).text();
    let presenter;

    customElements.define(
        componentName,
        class extends HTMLElement {
            constructor() {
                super();
                this.variables = {};
                let vars = findDoubleDollarWords(template);
                vars.forEach((vn) => {
                    vn = vn.slice(2);
                    this.variables[vn] = "";
                });
                this.templateArray = createTemplateArray(template);
            }

            async connectedCallback() {
                let content= template;
                let self = this;
                Array.from(self.attributes).forEach(attr => {
                    if(typeof self.variables[attr.nodeName]) {
                        self.variables[attr.nodeName] = attr.nodeValue;
                    }
                    if(attr.name === "data-presenter") {
                        self.presenter = window.appManager.initialisePresenter(attr.nodeValue);
                        self.presenter.invalidate = () => {
                            self.presenter.beforeRender();
                            for(let vn in self.variables) {
                                if(typeof self.presenter[vn] !== "undefined") {
                                    self.variables[vn] = self.presenter[vn];
                                }
                            }
                            self.refresh();
                        }
                    }
                });
                if(!self.presenter) {
                    self.refresh();
                }
            }

            refresh() {
                let contentArray = this.templateArray.map((item) => {
                    if(item.startsWith("$$")) {
                        let varName = item.slice(2);
                        return this.variables[varName];
                    }
                    return item;
                });

                this.innerHTML = contentArray.join("");
            }
        }
    );
};

defineComponent("llm-item-renderer","../components/llm-item-renderer/llm-item-renderer.html");

const appManager = new AppManager();
window.appManager = appManager;

// Actions that can be used from apihub-components controllers can be defined here

appManager.registerAction("showAddLLMModal", async (...params) => {
    await showModal(appManager._documentElement, "add-llm-modal", {});
})

appManager.registerAction("closeModal", async (modal,_param) => {
    closeModal(modal);
});



appManager.registerAction("changePage", (_target, toolId) => {
    appManager.currentToolId = toolId;
    appManager.navigateToToolPage();
})

appManager.registerAction("showActionBox", async (_target, primaryKey) => {
    appManager.showActionBox(primaryKey);
})

await appManager.init();

// Modal components defined here
defineComponent("add-llm-modal", "/components/add-llm-modal/add-llm-modal.html");
// defineComponent("llm-item-renderer", "/components/llm-item-renderer/llm-item-renderer.html");
defineComponent("llms-page", "/pages/llms-page/llms-page.html");
defineComponent("page-template", "/pages/page-template/page-template.html");
