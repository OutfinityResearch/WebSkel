import { getClosestParentElement } from "./dom-utils.js";

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

    if(waitForData){
        return new Promise((resolve, reject)=>{
            modal.addEventListener("close", (event)=>{
                resolve(event.data);
            });
        });
    }
    return modal;
}
function createModal(childTagName, modalData) {
    let modal = document.createElement("dialog");
    let componentString= "";
    if(modalData !== undefined) {
        Object.keys(modalData).forEach((componentKey) => {
            componentString +=` data-${componentKey}="${modalData[componentKey]}"`;
        });
    }
    if(webSkel.presentersRegistry[childTagName]){
        componentString += ` data-presenter="${childTagName}"`;
    }
    componentString === "" ? modal.innerHTML = `<${childTagName}/>`:modal.innerHTML = `<${childTagName}${componentString}/>`;
    modal.classList.add("modal", `${childTagName}-dialog`);

    return modal;
}

export function closeModal(element, data) {
    const existingModal = getClosestParentElement(element, "dialog");
    if(data){
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

export async function showActionBox(targetElement, primaryKey, componentName, insertionMode) {
    const existingComponentNode = document.getElementById(`${primaryKey}`);
    if (existingComponentNode) {
        return null;
    }
    const componentNode = document.createElement(`${componentName}`);
    /* We could use the id of the parent element instead and remove it here - TBD */
    componentNode.setAttribute("id", primaryKey);
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
