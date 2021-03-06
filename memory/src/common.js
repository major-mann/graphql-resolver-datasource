module.exports = {
    select,
    elementMatches
};

function elementMatches(key, element, search) {
    return key.every(key => element[key] === search[key]);
}

function select(input, shape) {
    if (!shape || typeof shape !== `object`) {
        return input;
    }

    if (!input || typeof input !== `object`) {
        throw new Error(`input MUST be an object`);
    }

    const result = {};
    Object.keys(shape).forEach(key => {
        if (shape[key] && typeof shape[key] === `object` && input && typeof input === `object`) {
            result[key] = select(input[key], shape[key]);
        } else {
            result[key] = input[key];
        }
    });
    return result;
}
