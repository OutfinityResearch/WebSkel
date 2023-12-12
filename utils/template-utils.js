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
 * Converts an SVG string to its Base64 encoded equivalent.
 * This function is intended for use in a browser environment.
 *
 * The Base64 encoded SVG can be used for embedding directly into HTML
 * or CSS, which is useful for inline images or background images.
 *
 * @param {string} svgString - A string containing valid SVG markup.
 * @returns {string} The Base64 encoded SVG string prefixed with the
 *                   necessary data URI scheme for SVG.
 *
 * @example
 * const svgString = `<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>`;
 * const base64EncodedSVG = svgToBase64(svgString);
 * // Use base64EncodedSVG in an <img> tag or as a CSS background
 */
function svgToBase64(svgString) {
    // Check if the input is a non-empty string
    if (typeof svgString !== 'string' || svgString.trim() === '') {
        throw new Error('svgToBase64 function expects a non-empty string.');
    }

    try {
        // Encode the SVG string to Base64 and prepend the data URI scheme
        return 'data:image/svg+xml;base64,' + window.btoa(svgString);
    } catch (error) {
        // Handle potential errors (like invalid characters) during encoding
        console.error('Error encoding SVG to Base64:', error);
        throw new Error('Failed to encode SVG to Base64.');
    }
}