export class StylesheetsService {
    constructor() {
        this.loadedStyleSheets = new Map();
    }

    async loadStyleSheet(href) {
        let refCount = this.loadedStyleSheets.get(href) || 0;
        if (refCount === 0) {
            await new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = () => resolve();
                link.onerror = () => reject(new Error(`Failed to load the CSS file: ${href}`));
                document.head.appendChild(link);
            });
        }
        this.loadedStyleSheets.set(href, refCount + 1);
    }

    unloadStyleSheet(href) {
        let refCount = this.loadedStyleSheets.get(href) || 0;
        if (refCount > 1) {
            this.loadedStyleSheets.set(href, refCount - 1);
        } else if (refCount === 1) {
            const link = document.head.querySelector(`link[href="${href}"]`);
            if (link) {
                document.head.removeChild(link);
            }
            this.loadedStyleSheets.delete(href);
        }
    }

    async loadStyleSheets(hrefArray) {
        await Promise.all(hrefArray.map(href => this.loadStyleSheet(href)));
    }

    async unloadStyleSheets(hrefArray) {
        hrefArray.forEach(href => this.unloadStyleSheet(href));
    }
}
