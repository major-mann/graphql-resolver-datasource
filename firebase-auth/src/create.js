module.exports = createCreateHandler;

function createCreateHandler(auth) {
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
        const user = await auth.createUser(args.input);
        return user;
    }

}
