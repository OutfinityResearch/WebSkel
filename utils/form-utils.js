import {getClosestParentElement, sanitize} from "./dom-utils.js";

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
    for (const element of namedElements) {
        if (element.disabled) {
            continue;
            //skip it
        }
        if (element.multiple && element.tagName === "SELECT") {
            formData.data[element.name] = Array.from(element.selectedOptions).map(option => option.value);
        } else {
            formData.data[element.name] = element.tagName === "CHECKBOX" || (element.tagName === "INPUT" && element.type === "checkbox") ? element.checked : element.value;
        }

        if (element.getAttribute("type") === "file") {
            if (element.multiple) {
                formData.data[element.name] = element.files;
            } else {
                try {
                    if (element.files.length > 0) {
                        formData.data[element.name] = await imageUpload(element.files[0])
                    }
                } catch (err) {
                    console.log(err);
                }
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
        if (isValid === true) {
            if (conditions) {
                let conditionFunctionName = element.getAttribute("data-condition")
                if (conditionFunctionName) {
                    isValid = conditions[conditionFunctionName].fn(element, formData);
                    if (isValid) {
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
        if (inputBorderElem) {
            if (!isValid) {
                inputBorderElem.classList.add("input-invalid");
            } else {
                inputBorderElem.classList.remove("input-invalid");
            }
        }
    }
    if (!form.checkValidity()) {
        form.reportValidity();
    }
    for (let key of Object.keys(formData.data)) {
        if (formData.elements[key] && formData.elements[key].element && formData.elements[key].element.hasAttribute("data-no-sanitize")) {
            continue;
        }
        formData.data[key] = sanitize(formData.data[key]);
    }
    return formData;
}

export async function imageUpload(file) {
    let base64String = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject) => {
        reader.onload = function () {
            base64String = reader.result;
            resolve(base64String);
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {
            reject("No file given as input at imageUpload");
        }
    })
}

export async function uploadFileAsText(file) {
    let string = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject) => {
        reader.onload = function () {
            string = reader.result;
            resolve(string);
        }
        if (file) {
            reader.readAsText(file);
        } else {
            reject("No file given as input");
        }
    })
}
