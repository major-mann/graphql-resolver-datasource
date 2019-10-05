module.exports = createUpdateHandler;

function createUpdateHandler(collection, createKey) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     */
    async function update(source, args) {
        const id = createKey(args.input);
        const { value: document } = await collection.findOneAndUpdate(
            { _id: id },
            { $set: args.input },
            { returnOriginal: false }
        );
        if (!document) {
            throw new Error(`Unable to find the document (${id}) from the update`);
        }
        return document;
    }

}
