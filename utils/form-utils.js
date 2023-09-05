import {getClosestParentElement} from "./dom-utils.js";

export async function extractFormInformation(element) {
    const form = getClosestParentElement(element, "form, [data-form]");
    const formData = {
        data: {},
        elements: {},
        isValid: false,
    };
    if (typeof form.checkValidity === "function") {
        formData.isValid = form.checkValidity();
    }
    const namedElements = [...form.querySelectorAll("[name]:not([type=hidden])")];

    let password={};

    for (const element of namedElements) {
        formData.data[element.name] = element.tagName === "CHECKBOX" ? element.checked : element.value;

        if(element.getAttribute("type") === "file") {
            try {
                formData.data[element.name] = await imageUpload(element.files[0]);
            } catch (err) {
                console.log(err);
            }
        }
        let isValid = false;
        if (typeof element.checkValidity === "function") {
            isValid = element.checkValidity();
        } else if (typeof element.getInputElement === "function") {
            const inputElement = await element.getInputElement();
            isValid = inputElement.checkValidity();
        }

        if(checkPasswordConfirm(element,password)){
            element.setCustomValidity("");
            isValid=true;
        }
        else {
            element.setCustomValidity("Passwords do not match!");
            isValid=false;
            formData.isValid=false;
        }
        formData.elements[element.name] = {
            isValid,
            element,
        };
    }
    if(!form.checkValidity()) {
        form.reportValidity();
    }
    return formData;
}

async function imageUpload(file) {
    let base64String = "";
    let reader = new FileReader();
    return await new Promise((resolve, reject)=>{
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

function checkPasswordConfirm(element, password){

    if(element.getAttribute("data-id") === "user-password"){
        password.password=element.value;
    }
    if(element.getAttribute("data-id") === "user-password-confirm"){
        return password.password === element.value;
    }
    return true;
}
export function checkValidityFormInfo(formInfo) {
    if(!formInfo.isValid) {
        let entries = Object.entries(formInfo.elements);
        for(const entry of entries) {
            if(!entry[1].isValid) {
                let input = document.querySelector("#" + entry[1].element.getAttribute("data-id"));
                input.classList.add("input-invalid");
            }
        }
        return false;
    }
    return true;
}