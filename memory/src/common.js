module.exports = {
    mold,
    elementMatches
};

function elementMatches(key, element, search) {
    return key.every(key => element[key] === search[key]);
}    

function mold(input, shape) {
    if (!shape || typeof shape !== `object`) {
        return input;
    }

    if (!input || typeof input !== `object`) {
        throw new Error(`input MUST be an object`);
    }

    const result = {};
    Object.keys(shape).forEach(key => {
        if (shape[key] === true && input[key] === undefined) {
            throw new Error(`input is missing required field "${key}"`);
        } else if (shape[key] && typeof shape[key] === `object`) {
            if (!input[key] || typeof input[key] !== `object`) {
                throw new Error(`input field "${key}" MUST be an object`);
            }
            result[key] = exec(input[key], shape);            
        } else {
            result[key] = input[key];
        }
    });
    return result;
}
