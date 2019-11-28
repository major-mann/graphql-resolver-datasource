module.exports = createFindHandler;

const { plainUserObject } = require(`./common.js`);

function createFindHandler(loadAuth) {
    return find;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to search for the entity with.
     * @param {object} args.input The search object
     * @param {object} args.input.tenantId The id of the tenant to find the user in
     * @throws When args.input is not an object
     */
    async function find(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        try {
            let user = await auth.getUser(args.input.uid);
            return plainUserObject(user);
        } catch (ex) {
            if (ex.code === `auth/user-not-found`) {
                return undefined;
            } else {
                throw ex;
            }
        }
    }
}
