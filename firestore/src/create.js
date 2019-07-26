module.exports = createCreateHandler;

function createCreateHandler(collection, createKey, autoGenerate) {
    return create;

    /**
     * Creates a new record in the data source. This record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     * @throws When args.input is not an object
     */
    async function create(source, args) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        let input = args.input;
        if (typeof autoGenerate === `function`) {
            input = autoGenerate(input) || input;
        }
        const id = createKey(input);
        const docRef = collection.doc(id);
        await docRef.create(args.input);
        return { ...args.input };
    }

}
