module.exports = function createFindHandler(collection, createKey) {
    return find;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to search for the entity with.
     * @param {object} args.input The search object
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment creation stats
     * @throws When args.input is not an object
     */
    async function find(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const key = createKey(args.input);
        const doc = await collection.doc(key)
            .get();

        const record = doc.exists ?
            doc.data() :
            undefined;

        if (record) {
            context.log.stat.increment(`datasource.firestore.find.found`);
        } else {
            context.log.stat.increment(`datasource.firestore.find.missing`);
        }
        return record;
    }

};
