module.exports = createUpsertHandler;

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
        const result = await collection.replaceOne(
            { _id: id },
            args.input,
            { upsert: true }
        );
        const document = result.ops[0];
        return document;
    }
}
