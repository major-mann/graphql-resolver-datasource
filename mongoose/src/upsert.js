module.exports = createUpsertHandler;

const { cleanResult } = require(`./common.js`);

function createUpsertHandler(collection, createKey) {
    return upsert;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     */
    async function upsert(source, args) {
        const id = createKey(args.input);
        const document = await collection.findOneAndReplace(
            { _id: id },
            { _id: id, ...args.input },
            {
                upsert: true,
                new: true
            }
        );
        let result;
        if (document) {
            result = cleanResult(document);
        } else {
            result = clone(args.input);
        }
        return result;
    }

    function clone(value) {
        if (typeof value === `function`) {
            return value;
        } else if (Array.isArray(value)) {
            return value.map(clone);
        } else if (value && typeof value === `object`) {
            const result = Object.create(Object.getPrototypeOf(value));
            Object.keys(value).forEach(key => result[key] = value[key]);
            return value;
        } else {
            return value;
        }
    }
}
