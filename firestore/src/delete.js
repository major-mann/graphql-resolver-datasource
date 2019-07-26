module.exports = function createDeleteHandler(collection, createKey) {
    return remove;

    /**
     * Removes a record from the data store
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object
     */
    async function remove(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const id = createKey(args.input);
        const docRef = collection.doc(id);

        const removed = await docRef.get();
        if (removed.exists) {
            await docRef.delete();
            context.log.stat.increment(`datasource.firestore.delete.found`);
            return removed.data();
        } else {
            context.log.stat.increment(`datasource.firestore.delete.missing`);
            return undefined;
        }
    }

};
