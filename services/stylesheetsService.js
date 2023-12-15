export class StylesheetsService {
    constructor() {
        this.loadedStyleSheets = new Map();
    }

    async loadStyleSheet(href, appComponent) {
        let refCount = this.loadedStyleSheets.get(href) || 0;
        if (refCount === 0) {
            await new Promise((resolve, reject) => {
                if (!appComponent) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    link.onload = () => resolve();
                    link.onerror = () => reject(new Error(`Failed to load the CSS file: ${href}`));
                    document.head.appendChild(link);
                } else {
                    try {
                        const style = document.createElement('style');
                        style.textContent = href;
                        document.head.appendChild(style);
                        resolve();
                    } catch (error) {
                        reject(new Error(`Failed to inject the CSS text: ${error}`));
                    }
                }
            });
        }
        this.loadedStyleSheets.set(href, refCount + 1);
    }

    unloadStyleSheet(href, appComponent) {
        let refCount = this.loadedStyleSheets.get(href) || 0;
        if (refCount > 1) {
            this.loadedStyleSheets.set(href, refCount - 1);
        } else if (refCount === 1) {
            let element;
            if (!appComponent) {
                element = document.head.querySelector(`link[href="${href}"]`);
            } else {
                const styles = document.head.querySelectorAll('style');
                for (let style of styles) {
                    if (style.textContent === href) {
                        element = style;
                        break;
                    }
                }
            }
            if (element) {
                document.head.removeChild(element);
            }
            this.loadedStyleSheets.delete(href);
        }
    }

    async loadStyleSheets(hrefArray, appComponent) {
        await Promise.all(hrefArray.map(href => this.loadStyleSheet(href, appComponent)));
    }

    async unloadStyleSheets(hrefArray, appComponent) {
        hrefArray.forEach(href => this.unloadStyleSheet(href, appComponent));
    }
}
