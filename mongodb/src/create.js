module.exports = createCreateHandler;

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
        const result = await collection.insertOne(input);
        return result.ops[0];
    }

}
