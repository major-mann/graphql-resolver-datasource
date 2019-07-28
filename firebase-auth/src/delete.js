module.exports = function createDeleteHandler(auth, find) {
    return remove;

    /**
     * Removes a record from the data store
     * @param {*} source Passed through to find
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment upsertion stats
     * @param {object} info The query information object
     * @throws When args.input is not an object
     */
    async function remove(source, args, context, info) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        const user = await find(source, args, context, info);
        if (user) {
            await auth.deleteUser(user.uid);
            context.stat.increment(`datasource.firebase-auth.delete.found`);
            return user;
        } else {
            context.stat.increment(`datasource.firebase-auth.delete.missing`);
            return undefined;
        }
    }

};
