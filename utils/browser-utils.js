/**
 * Identifies the client's browser type and version by parsing the user agent string.
 * This function facilitates browser-specific adjustments or optimizations by providing
 * essential information about the client's browsing environment. It covers a wide range
 * of browsers, including modern browsers like Chrome, Firefox, Safari, and legacy browsers
 * such as Internet Explorer. Special handling is included for browsers that are based on
 * other browsers' engines, such as Opera (which uses Chrome's Blink engine) and Edge.
 *
 * @returns {Object} An object containing two keys: `name` (the browser's name as a string)
 * and `version` (the browser version as a string). For example, {name: 'Chrome', version: '88'}.
 *
 * Usage Example:
 * const browserInfo = getBrowser();
 * console.log(browserInfo.name); // Outputs the browser's name.
 * console.log(browserInfo.version); // Outputs the browser version.
 *
 * Note: The accuracy of browser detection may vary due to the diversity of user agent strings
 * and the potential for their spoofing. It's advisable to use feature detection in addition
 * to, or instead of, browser detection when possible to ensure broader compatibility and future-proofing.
 */
export function getBrowser() {
    let userAgent = navigator.userAgent, tem,
        M = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        return {name: 'IE', version: (tem[1] || '')};
    }
    if (M[1] === 'Chrome') {
        tem = userAgent.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) {
            return {name: 'Opera', version: tem[1]};
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = userAgent.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        name: M[0], version: M[1]
    };
}

/*
* returns an object containing all url params
* */
export function getURLParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let result = {}
    for (let key of urlParams.keys()) {
        result[key] = urlParams.get(key);
    }

}

export function getHashParams() {
    const urlSplitArr = window.location.hash.split("?");
    let params = {};
    if (urlSplitArr[1]) {
        const hashParams = new URLSearchParams(urlSplitArr[1]);
        for (const [key, value] of hashParams) {
            params[key] = value;
        }
        return params;
    }
    return params;
}


