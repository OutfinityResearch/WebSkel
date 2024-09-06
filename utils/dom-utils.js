/**
 * Moves the cursor to the end of the content within an editable HTML element.
 * This function is highly compatible with various editable elements (e.g., div, span, p)
 * and supports both modern and legacy browsers. It's optimized to avoid redundant operations,
 * such as unnecessary refocusing of an already focused element.
 *
 * @param {HTMLElement} el - The HTML element to which the cursor will be moved.
 * If the element is not currently focused, the function will focus it before
 * proceeding with the cursor movement.
 *
 * Usage Example:
 * moveCursorToEnd(document.getElementById("editableElementId"));
 *
 * Note: This function requires the element to be already inserted into the DOM
 * for accurate execution. It also checks if the element is currently focused to
 * prevent redundant focusing.
 */
export function moveCursorToEnd(el) {
    if (!el) {
        console.error("moveCursorToEnd: No element provided");
        return;
    }
    if (document.activeElement !== el) {
        el.focus();
    }
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (typeof document.body.createTextRange !== "undefined") {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

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

/**
 * Finds the closest DOM element matching a given selector,
 * starting from a provided element and searching through its
 * siblings, parent elements, and their descendants.
 *
 * @param {Element} startElement The DOM element to start the search from.
 * @param {string} targetSelector The CSS selector to match against.
 * @param {string} [stopSelector] An optional CSS selector to specify when to stop traversing.
 * @param {boolean} [ignoreStartElement] An optional Flag to specify if we ignore the case when the searched element is the startElement
 * @returns {Element|null} The closest matching DOM element, or null if not found.
 * @throws {TypeError} If invalid arguments are provided.
 */
export function reverseQuerySelector(startElement, targetSelector, stopSelector = "", ignoreStartElement = false) {
    const visited = new Set();
    // Argument validation
    if (!(startElement instanceof Element)) {
        throw new TypeError('The first argument must be a DOM Element.');
    }
    if (typeof targetSelector !== 'string' || targetSelector.trim() === '') {
        throw new TypeError('The second argument must be a non-empty string.');
    }
    // Check the startElement first
    if (startElement.matches(targetSelector) && !ignoreStartElement) {
        return startElement;
    }
    visited.add(startElement);
    let currentElement = startElement;
    // Begin DOM traversal
    while (currentElement) {
        const parent = currentElement.parentElement;
        if (parent) {
            let sibling = parent.firstElementChild;

            // Search among siblings
            while (sibling) {
                if (!visited.has(sibling)) {
                    visited.add(sibling);

                    if (sibling !== currentElement && sibling.matches(targetSelector)) {
                        return sibling;
                    } else {
                        // BFS for descendants
                        if (sibling.children.length > 0) {
                            const bfsQueue = [sibling.firstElementChild];
                            while (bfsQueue.length > 0) {
                                const element = bfsQueue.shift();
                                if (!visited.has(element)) {
                                    visited.add(element);

                                    if (element.matches(targetSelector)) {
                                        return element;
                                    }

                                    let nextSibling = element.nextElementSibling;
                                    while (nextSibling) {
                                        bfsQueue.push(nextSibling);
                                        nextSibling = nextSibling.nextElementSibling;
                                    }

                                    if (element.firstElementChild) {
                                        bfsQueue.push(element.firstElementChild);
                                    }
                                }
                            }
                        }
                    }
                }
                sibling = sibling.nextElementSibling;
            }
        }
        // Ascend to the parent element
        currentElement = parent;
        if (currentElement && !visited.has(currentElement)) {
            visited.add(currentElement);
            // Check the parent
            if (currentElement.matches(targetSelector)) {
                return currentElement;
            }
            // Check if traversal should be stopped
            if (stopSelector && currentElement.matches(stopSelector)) {
                break;
            }
        }
    }
    // If no matching element is found
    return null;
}

export function notBasePage(url) {
    const slashCount = (url.match(/\//g) || []).length;

    /* If there's more than one slash or only one but not at the end */
    return !(slashCount > 1 || (slashCount === 1 && url.charAt(url.length - 1) !== '/'));
}

export function unsanitize(value) {
    if (value != null && typeof value === "string") {
        return value.replace(/&nbsp;/g, ' ')
            .replace(/&#13;/g, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }
    return '';
}

export function sanitize(value) {
    if (value != null && typeof value === "string") {
        return value.replace(/&/g, '&amp;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r\n/g, '&#13;')
            .replace(/[\r\n]/g, '&#13;').
            replace(/\s/g, '&nbsp;');
    }
    return value;
}


export function customTrim(str) {
    return str.replace(/^[\u00A0\s]+|[\u00A0\s]+$/g, '')
        .trim();
}

export function getMainAppContainer(element) {
    return getClosestParentElement(element, ".app-container");
}

/**
 * Retrieves the closest parent element of a specified element that has a designated presenter.
 * This function offers flexibility to either find any closest parent with a presenter or
 * specifically target a presenter with a given name. It's an efficient way to traverse
 * the DOM hierarchy and find relevant presenter elements.
 *
 * @param {HTMLElement} element - The starting HTML element from which the search for the closest parent will begin.
 * @param {string} [presenterName] - The specific name of the presenter to search for. If not provided,
 * the function will return the nearest parent with any presenter.
 *
 * Usage Example:
 * getClosestParentWithPresenter(document.getElementById("startElement"), "specificPresenterName");
 * getClosestParentWithPresenter(document.getElementById("startElement"));
 *
 * Note: The function relies on the presence of a 'data-presenter' attribute in parent elements
 * to identify presenter elements. It's designed to work efficiently by leveraging the
 * getClosestParentElement utility function, ensuring optimal DOM traversal.
 */
export function getClosestParentWithPresenter(element, presenterName) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error("getClosestParentWithPresenter: Invalid or no element provided");
        return null;
    }
    const selector = presenterName ? `[data-presenter="${presenterName}"]` : "[data-presenter]";
    return reverseQuerySelector(element, selector, "", true);
}

export function invalidateParentElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error("invalidateParentElement: Invalid or no element provided");
        return null;
    }
    refreshElement(getClosestParentWithPresenter(element));
}

/**
 * Refreshes the specified HTML element by calling the `invalidate` method on its associated webSkelPresenter.
 * This function is designed to facilitate dynamic updates of web components that are managed by a webSkelPresenter.
 * It's particularly useful in scenarios where the state or content of a web component needs to be refreshed
 * without reloading the entire page.
 *
 * @param {HTMLElement} element - The HTML element that needs to be refreshed. The element is expected
 * to be associated with a webSkelPresenter which has the `invalidate` method.
 *
 * Usage Example:
 * refreshElement(document.getElementById("dynamicContent"));
 *
 * Note: This function assumes that the provided element has a webSkelPresenter property. It's crucial
 * that this property exists and has an `invalidate` method. If the element or its presenter is not properly
 * configured, the function will log an error to the console.
 */
export function refreshElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error("refreshElement: Invalid or no element provided");
        return;
    }

    if (!element.webSkelPresenter || typeof element.webSkelPresenter.invalidate !== 'function') {
        console.error("refreshElement: Element does not have a webSkelPresenter with an invalidate method");
        return;
    }
    element.webSkelPresenter.invalidate();
}
