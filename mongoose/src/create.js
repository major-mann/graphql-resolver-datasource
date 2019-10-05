module.exports = createCreateHandler;

const { cleanResult } = require(`./common.js`);

function createCreateHandler(collection, createKey, autoGenerate) {
    return create;

    /**
     * Creates a new record in the data source.
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     */
    async function create(source, args) {
        let input = args.input;
        if (typeof autoGenerate === `function`) {
            input = autoGenerate(input) || input;
        }

        const id = createKey(input);
        input = { ...input, _id: id };
        const doc = await collection.create(input);
        const result = cleanResult(doc);
        return result;
    }

}
