export class StylesheetsService {
    constructor() {
        this.loadedStyleSheets = new Set();
    }
    async loadStyleSheet(href) {
        if (!this.loadedStyleSheets.has(href)) {
            await new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = () => {
                    this.loadedStyleSheets.add(href);
                    resolve();
                };
                link.onerror = () => reject(new Error(`Failed to load the CSS file: ${href}`));
                document.head.appendChild(link);
            });
        }
    }
    unloadStyleSheet(href) {
        if (this.loadedStyleSheets.has(href)) {
            const link = document.head.querySelector(`link[href="${href}"]`);
            if (link) {
                document.head.removeChild(link);
                this.loadedStyleSheets.delete(href);
            }
        }
    }

    async loadStyleSheets(hrefArray) {
        await Promise.all(hrefArray.map(href => this.loadStyleSheet(href)));
    }
    async unloadStyleSheets(hrefArray) {
        await Promise.all(hrefArray.map(href => this.unloadStyleSheet(href)));

    }
}