module.exports = createUpsertHandler;

function createUpsertHandler(find, create, update) {
    return upsert;

    /**
     * Creates a new record in the data source if it does not exist, otherwise replaces an existing one. This
     *  record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @param {object} info The query information
     * @throws When args.input is not an object
     */
    async function upsert(source, args, context, info) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const user = await find(source, args, context, info);
        if (user) {
            // Note: We do this to cause an effective replace
            args = {
                ...args,
                input: {
                    uid: args.input.uid,
                    email: args.input.email,
                    emailVerified: args.input.emailVerified,
                    phoneNumber: args.input.phoneNumber || null,
                    // We put null to cause an error if it's not supplied
                    password: args.input.password || null,
                    // We put null to cause an error if it's not supplied
                    disabled: args.input.disabled || false
                }
            };
            return update(source, args, context, info);
        } else {
            return create(source, args, context, info);
        }
    }

}
