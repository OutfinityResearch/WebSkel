export class UtilsService {
    constructor() {
    }

    async initialize() {
        const utilModules = [
            {key: 'domUtils', path: '../utils/dom-utils.js'},
            {key: 'formUtils', path: '../utils/form-utils.js'},
            {key: 'modalUtils', path: '../utils/modal-utils.js'},
            {key: 'templateUtils', path: '../utils/template-utils.js'},
            {key: 'browserUtils', path: '../utils/browser-utils.js'}
        ];

        for (const {key, path} of utilModules) {
            const moduleExports = await import(path);
            for (const [exportName, exportFunction] of Object.entries(moduleExports)) {
                this[exportName] = exportFunction;
            }
        }
    }
}
