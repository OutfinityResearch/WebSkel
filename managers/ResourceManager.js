export class ResourceManager {
    constructor() {
        this.loadedStyleSheets = new Map();
        this.components = {};
    }

    async loadStyleSheets(styleSheet, identifier) {
        const loadPromises = [];
        loadPromises.push(...styleSheet.map(cssText => this.loadStyleSheet({ cssText:cssText, identifier:identifier })));
        return (await Promise.all(loadPromises)).join("");
    }
    async loadStyleSheet({ url = null, cssText = null, identifier = null }) {
        if (!url && !cssText) {
            throw new Error('Either a URL or CSS text must be provided.');
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

    async loadComponent(component, loadedTemplate, loadedCSSs){
        if(!this.components[component.name]){
            this.components[component.name] = {
                html: "",
                css: "",
                presenter: ""
            };
            let componentPath = `./${webSkel.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.html`;
            let template = "";
            loadedTemplate ? template = loadedTemplate : template = await (await fetch(componentPath)).text();
            this.components[component.name].html = template;

            let css = "";
            let cssPath = `./${webSkel.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.css`;
            if(loadedCSSs){
                css = loadedCSSs;
            } else {
                css = await (await fetch(cssPath)).text();
                css = [css];
            }
            this.components[component.name].css = css;
            await this.loadStyleSheets(css, component.name);

            let PresenterModule;
            if(component.presenterClassName){
                let presenterPath = `../../${webSkel.configs.webComponentsRootDir}/${component.type}/${component.name}/${component.name}.js`;
                PresenterModule = await import(presenterPath);
                this.registerPresenter(component.name, PresenterModule[component.presenterClassName]);
            }
            return {
                html: template,
                css: css
            }
        } else {
            await this.loadStyleSheets(this.components[component.name].css, component.name);
            return {
                html: this.components[component.name].html,
                css: this.components[component.name].css
            }
        }
    }
    registerPresenter(name, presenterClass) {
        this.components[name].presenter = presenterClass;
    }

    initialisePresenter(presenterName, component, invalidate) {
        let presenter;
        try {
            presenter = new this.components[component.componentName].presenter(component, invalidate);
        } catch (e) {
            showApplicationError(`Error creating a presenter instance`, `Encountered an error during the initialization of ${presenterName} for component ${component}`, `${e}`);
            return undefined;
        }
        return presenter;
    }
}
