module.exports = function createDeleteHandler(collection, createKey) {
    return remove;

    /**
     * Removes a record from the data store
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment upsertion stats
     */
    async function remove(source, args, context) {
        const id = createKey(args.input);
        const { value: document } = await collection.findOneAndDelete({ _id: id });
        if (document) {
            context.stat.increment(`datasource.mongodb.delete.found`);
            return document;
        } else {
            context.stat.increment(`datasource.mongodb.delete.missing`);
            return undefined;
        }
    }

};
