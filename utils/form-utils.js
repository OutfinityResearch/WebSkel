import { getClosestParentElement } from "./dom-utils.js";

export async function extractFormInformation(element, conditions) {
    const form = getClosestParentElement(element, "form");
    const formData = {
        data: {},
        elements: {},
        isValid: false,
    };
    if (typeof form.checkValidity === "function") {
        formData.isValid = form.checkValidity();
    }
    const namedElements = [...form.querySelectorAll("[name]:not([type=hidden])")];
    let password = {};
    for (const element of namedElements) {

        if(element.multiple){
            formData.data[element.name] = Array.from(element.selectedOptions).map(option => option.value);
        }else {
            formData.data[element.name] = element.tagName === "CHECKBOX" ? element.checked : element.value;
        }

        if(element.getAttribute("type") === "file") {
            try {
                if(element.files.length>0) {
                    formData.data[element.name] = await imageUpload(element.files[0])
                }
            } catch (err) {
                console.log(err);
            }
        }
        let isValid = true;
        element.setCustomValidity("");
        if (typeof element.checkValidity === "function") {
            isValid = element.checkValidity();
        } else if (typeof element.getInputElement === "function") {
            const inputElement = await element.getInputElement();
            isValid = inputElement.checkValidity();
        }
        if(isValid === true) {
            if (conditions) {
                let conditionFunctionName = element.getAttribute("data-condition")
                if (conditionFunctionName) {
                    isValid = conditions[conditionFunctionName].fn(element, formData);
                    if(isValid) {
                        element.setCustomValidity("");
                    } else {
                        element.setCustomValidity(conditions[conditionFunctionName].errorMessage);
                        formData.isValid = false;
                    }
                }
            }
        }
        formData.elements[element.name] = {
            isValid,
            element
        };
        let inputBorderElem = document.querySelector(`[data-id = '${element.getAttribute("id")}' ]`);
        if(!isValid) {
            inputBorderElem.classList.add("input-invalid");
        }
        else {
            inputBorderElem.classList.remove("input-invalid");
        }
    }
    if(!form.checkValidity()) {
        form.reportValidity();
    }
    return formData;
}

async function imageUpload(file) {
    let base64String = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject) => {
        reader.onload = function () {
            base64String = reader.result;
            resolve(base64String);
        }
        if(file) {
            reader.readAsDataURL(file);
        } else {
            reject("No file given as input at imageUpload");
        }
    })
}

export function checkValidityFormInfo(formInfo) {
    if(!formInfo.isValid) {
        let entries = Object.entries(formInfo.elements);
        for(const entry of entries) {

        }
        return false;
    }
    return true;
}