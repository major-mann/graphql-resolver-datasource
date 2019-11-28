module.exports = createDeleteHandler;

const { plainUserObject } = require(`./common.js`);

function createDeleteHandler(loadAuth, find) {
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
     */
    async function remove(source, args, context, info) {
        const user = await find(source, args, context, info);
        if (user) {
            const auth = await loadAuth(args.input.tenantId);
            await auth.deleteUser(user.uid);
            context.stat.increment(`datasource.firebase-auth.delete.found`);
            return plainUserObject(user);
        } else {
            context.stat.increment(`datasource.firebase-auth.delete.missing`);
            return undefined;
        }
    }
}
