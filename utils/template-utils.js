export function findDoubleDollarWords(str) {
    let regex = /\$\$[\w\-_]+/g;
    return str.match(regex) || []; // Returnează un array de cuvinte sau un array gol dacă nu se găsesc cuvinte
}

export function createTemplateArray(str) {
    let currentPos = 0;
    const STR_TOKEN = 0;
    const VAR_TOKEN = 1;
    function isSeparator(ch) {
        const regex = /^[a-zA-Z0-9_\-$]$/;
        return !regex.test(ch);
    }

    function startVariable(cp) {
        if(str[cp] !== '$' || str[cp + 1] !== '$') {
            return STR_TOKEN;
        }
        else {
            return VAR_TOKEN;
        }
    }

    let result = [];
    let k = 0;
    while(k < str.length ) {
        while(!startVariable(k) && k < str.length) {
            k++;
        }
        result.push(str.slice(currentPos, k));
        currentPos = k;
        while(!isSeparator(str[k]) && k < str.length) {
            k++;
        }
        result.push(str.slice(currentPos, k));
        currentPos = k;
    }
    return result;
}

/**
 * Encodes a given string to its Base64 encoded equivalent.
 * This function is intended for use in a browser environment and can handle
 * any textual data, including SVG, HTML, or plain text.
 *
 * The Base64 encoded data can be used for embedding directly into HTML, CSS,
 * or for other purposes where Base64 encoding is needed.
 *
 * @param {string} dataString - A string containing the data to be encoded.
 * @param {string} mimeType - The MIME type of the data (e.g., 'image/svg+xml').
 * @returns {string} The Base64 encoded string prefixed with the necessary
 *                   data URI scheme for the given MIME type.
 *
 * @example
 * const svgString = `<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>`;
 * const base64EncodedSVG = encodeToBase64(svgString, 'image/svg+xml');
 * // Use base64EncodedSVG in an <img> tag or as a CSS background
 *
 * @example
 * const plainText = 'Hello, World!';
 * const base64EncodedText = encodeToBase64(plainText, 'text/plain');
 * // Use base64EncodedText where Base64 encoded text is needed
 */
export function encodeToBase64(dataString, mimeType) {
    if (typeof dataString !== 'string' || dataString.trim() === '') {
        throw new Error('Input data must be a non-empty string.');
    }

    if (typeof mimeType !== 'string' || mimeType.trim() === '') {
        throw new Error('MIME type must be a non-empty string.');
    }

    try {
        return `data:${mimeType};base64,` + window.btoa(dataString);
    } catch (error) {
        console.error('Error encoding data to Base64:', error);
        throw new Error('Failed to encode data to Base64.');
    }
}


/**
 * Decodes a Base64 encoded string.
 * This function can decode any data that has been encoded in Base64 format,
 * making it versatile for various types of data (e.g., SVG, images, text).
 *
 * Note: The input should be a Base64 encoded string, typically
 * in the format of a Data URL (e.g., 'data:image/png;base64,iVBORw0KG...').
 *
 * @param {string} base64EncodedData - The Base64 encoded string to be decoded.
 * @returns {string} The decoded string.
 * @throws {Error} Throws an error if the input is not a string or if decoding fails.
 */
export function decodeBase64(base64EncodedData) {
    if (typeof base64EncodedData !== 'string') {
        throw new Error('Input must be a Base64 encoded string.');
    }
    let splitedArr = base64EncodedData.split(',');

    let base64Data = splitedArr[0].startsWith("data:") ? splitedArr[1] : splitedArr[0];

    if (!base64Data) {
        throw new Error('Invalid Base64 data format.');
    }

    try {
        return atob(base64Data);
    } catch (error) {
        console.error('Error decoding Base64 string:', error);
        throw new Error('Failed to decode Base64 string.');
    }
}
