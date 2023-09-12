export function getClosestParentElement(element, selector, stopSelector) {
    let closestParent = null;
    while (element) {
        if (element.matches(selector)) {
            closestParent = element;
            break;
        } else if (stopSelector && element.matches(stopSelector)) {
            break;
        }
        element = element.parentElement;
    }
    return closestParent;
}

export function notBasePage(url) {
    const slashCount = (url.match(/\//g) || []).length;

    /* If there's more than one slash or only one but not at the end */
    return !(slashCount > 1 || (slashCount === 1 && url.charAt(url.length - 1) !== '/'));
}

export function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
        ' ': '&nbsp;'
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

export function getMainAppContainer(element) {
    return getClosestParentElement(element, ".app-container");
}


