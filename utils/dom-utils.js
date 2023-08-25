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
export function urlForPage(url) {
    let count = 0;
    for (let i = 0; i < url.length; i++) {
        if (url[i] === '/') {
            count++;
        }
    }
    return !(count > 1 || (count === 1 && url[url.length - 1] !== '/'));
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
        '=': '&#x3D;'
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

export function getMainAppContainer(element) {
    return getClosestParentElement(element, ".app-container");
}


