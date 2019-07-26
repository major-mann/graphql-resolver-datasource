module.exports = createUpdateHandler;

function createUpdateHandler(collection, createKey) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @throws When args.input is not an object
     */
    async function update(source, args) {
        if (!args.input) {
            throw new Error(`No input value supplied in args`);
        }

        const id = createKey(args.input);
        const docRef = collection.doc(id);
        await docRef.update(args.input);
        const doc = await docRef.get();

        if (doc.exists) {
            return doc.data();
        } else {
            throw new Error(`Unable to find the document (${id}) from the update`);
        }
    }

}
