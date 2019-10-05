module.exports = {
    cleanResult
};

function cleanResult(result) {
    if (result && typeof result.toJSON === `function`) {
        result = result.toJSON();
    }
    if (!result || typeof result !== `object`) {
        return result;
    }
    delete result._id;
    delete result.__v;
    return result;
}
