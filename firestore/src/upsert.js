module.exports = createUpsertHandler;

function createUpsertHandler(collection, createKey) {
    return upsert;

    /**
     * Creates a new record in the data source if it does not exist, otherwise replaces an existing one. This
     *  record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @throws When args.input is not an object
     */
    async function upsert(source, args) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const id = createKey(args.input);
        const docRef = collection.doc(id);
        const copy = { ...args.input };
        await docRef.set(copy, { merge: false });
        return copy;
    }
}
