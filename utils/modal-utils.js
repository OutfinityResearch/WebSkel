import { getClosestParentElement, getMainAppContainer } from "./dom-utils.js";

export async function showModal(element, modalComponentName, componentProps) {
    const existingModalContainer = getClosestParentElement(element, "dialog");
    if (existingModalContainer) {
        existingModalContainer.close();
        existingModalContainer.remove();
    }
    const modalContainer = element || getMainAppContainer(element);
    const modal = Object.assign(createModal(modalComponentName,componentProps), {
        component: modalComponentName,
        cssClass: modalComponentName,
        componentProps,
    });
    modalContainer.appendChild(modal);
    await modal.showModal();
    return modal;
}

function createModal(childTagName, componentProps) {
    let modal = document.createElement("dialog");
    let componentString= "";
    if(componentProps !== undefined) {
        Object.keys(componentProps).forEach((componentKey) => {
            componentString +=` data-${componentKey}="${componentProps[componentKey]}"`;
        });
    }
    componentString === "" ? modal.innerHTML = `<${childTagName}/>`:modal.innerHTML = `<${childTagName}${componentString}/>`;
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

export async function showActionBox(targetElement, primaryKey, componentName, insertionMode) {
    const existingComponentNode = document.getElementById(`${primaryKey}`);
    if (existingComponentNode) {
        return null;
    }
    const componentNode = document.createElement(`${componentName}`);
    /* We could use the id of the parent element instead and remove it here - TBD */
    componentNode.setAttribute("id", primaryKey);
    let oldComponentNode;
    const removeComponent = () => {
        if (componentNode) {
            componentNode.remove();
            document.removeEventListener('click', clickHandler);
        }
    };


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
            removeComponent();
        }
    };
    componentNode.clickHandler=clickHandler;
    document.addEventListener('click', clickHandler);
    return componentNode;
}