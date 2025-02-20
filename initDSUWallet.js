const MAIN_SSI_LOCAL_STORAGE_KEY = "mainssi";


function arrayBufferToHex(arrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(arrayBuffer), (n) => ("0" + n.toString(16)).slice(-2)).join("");
}

function overwriteIframeLog() {
    console.warn = (...args) => console.log(...args);
}

async function defineNativeComponents() {
    const define = async (name) => {
        const { default: component } = await import(`../wallet/components/${name}/${name}.js`);
        customElements.define(name, component);
    };

}
async function setMainDSU(opendsu, crypto) {
    const resolver = opendsu.loadAPI("resolver");

    if ($$.environmentType !== opendsu.constants.ENVIRONMENT_TYPES.BROWSER_ENVIRONMENT_TYPE) {
        return;
    }

    const environmentJs = await import("../assets/environment.js");
    if (
        !environmentJs ||
        !environmentJs.default ||
        !environmentJs.default.storageType ||
        environmentJs.default.storageType === "localStorage"
    ) {
        let mainSSI = window.localStorage.getItem(MAIN_SSI_LOCAL_STORAGE_KEY);
        if (mainSSI) {
            const mainDSU = await $$.promisify(resolver.loadDSU)(mainSSI);
            opendsu.setGlobalVariable("rawDossier", mainDSU);
            return;
        }

        const ssiPath = arrayBufferToHex(crypto.randomBytes(64));

        const versionlessDSU = await $$.promisify(resolver.createVersionlessDSU)(ssiPath);
        await $$.promisify(versionlessDSU.writeFile)("../environment.json", JSON.stringify(environmentJs.default));

        opendsu.setGlobalVariable("rawDossier", versionlessDSU);

        const versionlessDSUKeySSI = await $$.promisify(versionlessDSU.getKeySSIAsString)();
        window.localStorage.setItem(MAIN_SSI_LOCAL_STORAGE_KEY, versionlessDSUKeySSI);
    }
    console.log("environmentJs", environmentJs);
}

export async function initDSUWallet(opendsu, crypto){
    try {
        await setMainDSU(opendsu, crypto);
    } catch (error) {
        console.error("Failed to set Main DSU", error);
    }

    const enclaveAPI = opendsu.loadAPI("enclave");

    enclaveAPI.initialiseVersionlessDSUEnclave();
    overwriteIframeLog();

    try {
        await defineNativeComponents();
    } catch (error) {
        console.error('Error while defining Custom HTML Elements', error);
    }
}
