import { getClosestParentElement, getMainAppContainer } from "./dom-utils.js";

export async function showModal(element, modalComponentName, componentProps) {
    const existingModalContainer = getClosestParentElement(element, "dialog");
    if (existingModalContainer) {
        existingModalContainer.close();
        existingModalContainer.remove();
    }

    const modalContainer = element || getMainAppContainer(element);
    const modal = Object.assign(createModal(modalComponentName), {
        component: modalComponentName,
        cssClass: modalComponentName,
        componentProps,
    });
    modalContainer.appendChild(modal);

    await modal.showModal();
    return modal;
}

function createModal(childTagName) {
    let modal=document.createElement("dialog");
    modal.innerHTML=`<${childTagName}/>`;
    modal.classList.add("modal");
    return modal;
}

export function closeModal(element) {
    const existingModal = getClosestParentElement(element, "dialog");
    if (existingModal) {
        existingModal.close();
        existingModal.remove();
    }
}

export function showActionBox(targetElement,primaryKey,componentName,insertionMode) {
    const existingComponentNode = document.getElementById(`${primaryKey}`);
    if (existingComponentNode) {
        return;
    }
    const componentNode=document.createElement(`${componentName}`);
    /* We could use the id of the parent element instead - TBD */
    componentNode.setAttribute("id",`${primaryKey}`);

    switch (insertionMode){
        case "prepend":
            targetElement.insertBefore(componentNode,targetElement.firstChild);
            break;
        case "append":
            targetElement.appendChild(componentNode);
            break;
        default: console.error("Invalid Insertion Mode");
    }
    document.addEventListener('click', (event) => {
        if (!componentNode.contains(event.target)) {
            componentNode.remove();
        }
    });
}