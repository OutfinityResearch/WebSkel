import { getClosestParentElement } from "./dom-utils.js";
import WebSkel from "../webSkel.js";

export async function showModal(modalComponentName, componentProps, waitForData) {
    if(typeof componentProps === "boolean"){
        waitForData = componentProps;
        componentProps = undefined;
    }
    const bodyElement = document.querySelector("body");
    const existingModalContainer = getClosestParentElement(bodyElement, "dialog");
    if (existingModalContainer) {
        existingModalContainer.close();
        existingModalContainer.remove();
    }

    const modal = Object.assign(createModal(modalComponentName, componentProps), {
        component: modalComponentName,
        cssClass: modalComponentName,
        componentProps
    });
    bodyElement.appendChild(modal);
    await modal.showModal();
    modal.addEventListener("keydown",preventCloseOnEsc);
    if(waitForData){
        return new Promise((resolve)=>{
            modal.addEventListener("close", (event)=>{
                resolve(event.data);
            });
        });
    }
    return modal;
}

function preventCloseOnEsc(event){
    if(event.key === "Escape"){
        event.preventDefault();
    }
}
function createModal(childTagName, modalData) {
    let modal = document.createElement("dialog");
    let componentString= "";
    if(modalData !== undefined) {
        Object.keys(modalData).forEach((componentKey) => {
            componentString +=` data-${componentKey}="${modalData[componentKey]}"`;
        });
    }
    let component = WebSkel.instance.configs.components.find(component => component.name === childTagName);
    if(component.presenterClassName){
        componentString += ` data-presenter="${childTagName}"`;
    }
    componentString === "" ? modal.innerHTML = `<${childTagName}/>`:modal.innerHTML = `<${childTagName}${componentString}/>`;
    modal.classList.add("modal", `${childTagName}-dialog`);

    return modal;
}

export function closeModal(element, data) {
    const existingModal = getClosestParentElement(element, "dialog");
    if(data !== undefined) {
        let closeEvent = new Event('close', {
            bubbles: true,
            cancelable: true
        });
        closeEvent.data = data;
        existingModal.dispatchEvent(closeEvent);
    }
    if (existingModal) {
        existingModal.close();
        existingModal.remove();
    }
}

export function removeActionBox(actionBox, instance){
    document.removeEventListener('click', actionBox.clickHandler);
    actionBox.remove();
    if(instance !== undefined) {
        delete instance.actionBox;
    }
}

export async function showActionBox(targetElement, primaryKey, componentName, insertionMode, props = {}) {
    //TODO: remove primaryKey, it is not used
    const existingComponentNode = targetElement.parentNode.querySelector(componentName);
    if (existingComponentNode) {
        return null;
    }
    const componentNode = document.createElement(`${componentName}`);
    for(const [key, value] of Object.entries(props)) {
        componentNode.setAttribute(`data-${key}`, value);
    }
    let oldComponentNode;
    switch (insertionMode) {
        case "prepend":
            targetElement.parentNode.insertBefore(componentNode, targetElement);
            break;

        case "append":
            targetElement.parentNode.appendChild(componentNode);
            break;

        case "replace":
            oldComponentNode = targetElement;
            const parentNode = oldComponentNode.parentNode;
            parentNode.removeChild(oldComponentNode);
            parentNode.appendChild(componentNode);
            break;

        case "replace-all":
            oldComponentNode = targetElement.parentNode;
            const parentElement = oldComponentNode;
            oldComponentNode = parentElement.innerHTML;
            parentElement.innerHTML = '';
            parentElement.appendChild(componentNode);
            break;

        default:
            console.error(`Invalid Insertion Mode: ${insertionMode}. No changes to the DOM have been made`);
            return;
    }

    let clickHandler = (event) => {
        if (componentNode && !componentNode.contains(event.target)) {
            if (insertionMode === "replace" && oldComponentNode) {
                const parentNode = componentNode.parentNode;
                parentNode.removeChild(componentNode);
                parentNode.appendChild(oldComponentNode);
            }
            else if (insertionMode === "replace-all" && oldComponentNode) {
                const parentElement = componentNode.parentNode;
                parentElement.innerHTML = oldComponentNode;
            }
            removeActionBox(componentNode);
        }
    };
    componentNode.clickHandler=clickHandler;
    document.addEventListener('click', clickHandler);
    return componentNode;
}
export async function createReactiveModal(modalComponentName, componentProps, waitForData = false) {
    if(typeof componentProps === "boolean"){
        waitForData = componentProps;
        componentProps = undefined;
    }

    const bodyElement = document.querySelector("body");
    const existingModalContainer = getClosestParentElement(bodyElement, "dialog");
    if (existingModalContainer) {
        existingModalContainer.close();
        existingModalContainer.remove();
    }

    let modal = document.createElement("dialog");
    modal.classList.add("modal", `${modalComponentName}-dialog`);

    const webSkelInstance = window.WebSkel||assistOS.UI;
    if (!webSkelInstance) {
        throw new Error("WebSkel instance not found for reactive modal");
    }

    let component = webSkelInstance.configs.components.find(component => component.name === modalComponentName);

    const componentProxy = webSkelInstance.createElement(
        modalComponentName,
        modal,
        componentProps || {},
        component?.presenterClassName ? { 'data-presenter': modalComponentName } : {},
        true
    );

    Object.assign(modal, {
        component: modalComponentName,
        cssClass: modalComponentName,
        componentProps: componentProps,
        _componentProxy: componentProxy
    });

    const modalProxy = new Proxy(modal, {
        get(target, prop) {
            if (prop === 'props') {
                return componentProxy;
            }
            return Reflect.get(target, prop);
        }
    });

    bodyElement.appendChild(modal);
    await modal.showModal();
    modal.addEventListener("keydown", preventCloseOnEsc);

    if(waitForData){
        return new Promise((resolve)=>{
            modal.addEventListener("close", (event)=>{
                resolve(event.data);
            });
        });
    }

    return modalProxy;
}