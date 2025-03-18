import WebSkel from "../webSkel.js";

export class ResourceManager {
    constructor() {
        this.loadedStyleSheets = new Map();
        this.components = {};
    }

    async loadStyleSheets(styleSheet, identifier) {
        const loadPromises = [];
        loadPromises.push(...styleSheet.map(cssText => this.loadStyleSheet({
            cssText: cssText,
            identifier: identifier
        })));
        return (await Promise.all(loadPromises)).join("");
    }

    async loadStyleSheet({url = null, cssText = null, identifier = null}) {
        if (!url && !cssText) {
            return;
        }

        const key = identifier || url;
        let refCount = this.loadedStyleSheets.get(key) || 0;
        this.loadedStyleSheets.set(key, refCount + 1);

        if (refCount === 0) {
            return new Promise((resolve, reject) => {
                try {
                    const style = document.createElement('style');
                    style.textContent = cssText;
                    if (identifier) {
                        style.className = identifier;
                    }
                    document.head.appendChild(style);
                    resolve(style.outerHTML);
                } catch (error) {
                    reject(new Error(`Failed to inject the CSS text: ${error.message}`));
                }
            });
        }
    }

    async unloadStyleSheets(identifier) {
        let refCount = this.loadedStyleSheets.get(identifier);
        if (refCount !== undefined) {
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
        styleElements.forEach(element => document.head.removeChild(element));
    }

    async loadComponent(component) {
        if (!this.components[component.name]) {
            this.components[component.name] = {
                html: "",
                css: [],
                presenter: null,
                loadingPromise: null,
                isPromiseFulfilled: false,
            };

            return this.components[component.name].loadingPromise = (async () => {
                try {
                    let componentPath;
                    let cssPath;
                    if(component.directory){
                        componentPath = `./${WebSkel.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.html`;
                        cssPath = `./${WebSkel.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.css`;
                    } else {
                        componentPath = `./${WebSkel.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.html`;
                        cssPath = `./${WebSkel.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.css`;
                    }
                    const template = component.loadedTemplate || await (await fetch(componentPath)).text();
                    this.components[component.name].html = template;

                    const css = component.loadedCSSs || [await (await fetch(cssPath)).text()];
                    this.components[component.name].css = css;
                    await this.loadStyleSheets(css, component.name);

                    if (component.presenterClassName) {
                        if(component.presenterModule){
                            this.registerPresenter(component.name, component.presenterModule[component.presenterClassName]);
                        } else {
                            let presenterPath;
                            if(component.directory){
                                presenterPath = `../../${WebSkel.instance.configs.webComponentsRootDir}/${component.directory}/${component.type}/${component.name}/${component.name}.js`;
                            } else {
                                presenterPath = `../../${WebSkel.instance.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.js`;
                            }
                            const PresenterModule = await import(presenterPath);
                            this.registerPresenter(component.name, PresenterModule[component.presenterClassName]);
                        }
                    }
                    this.components[component.name].isPromiseFulfilled = true;
                    return { html: template, css: css };
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

    initialisePresenter(presenterName, component, invalidate,props={}) {
        let presenter;
        try {
            presenter = new this.components[component.componentName].presenter(component, invalidate,props);
            component.isPresenterReady = true;
            component.onPresenterReady();
        } catch (e) {
            showApplicationError(`Error creating a presenter instance`, `Encountered an error during the initialization of ${presenterName} for component: ${component.componentName}`, e + ":"+ e.stack.split('\n')[1]);
        }
        return presenter;
    }
}
