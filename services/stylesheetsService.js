export class StylesheetsService {
    constructor() {
        this.loadedStyleSheets = new Map();
    }

    async loadStyleSheets(styleSheets, identifier) {
        const loadPromises = [];

        if (styleSheets.urls) {
            loadPromises.push(...styleSheets.urls.map(url => this.loadStyleSheet({ url:url, identifier:identifier })));
        }

        if (styleSheets.cssTexts) {
            loadPromises.push(...styleSheets.cssTexts.map(cssText => this.loadStyleSheet({ cssText:cssText, identifier:identifier })));
        }

        await Promise.all(loadPromises);
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
                if (url) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    link.onload = resolve;
                    link.onerror = () => reject(new Error(`Failed to load the CSS file: ${url}`));
                    if (identifier) {
                        link.className = identifier;
                    }
                    document.head.appendChild(link);
                } else if (cssText) {
                    try {
                        const style = document.createElement('style');
                        style.textContent = cssText;
                        if (identifier) {
                            style.className = identifier;
                        }
                        document.head.appendChild(style);
                        resolve();
                    } catch (error) {
                        reject(new Error(`Failed to inject the CSS text: ${error.message}`));
                    }
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
}
