module.exports = function createFindHandler(auth) {
    return find;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to search for the entity with.
     * @param {object} args.input The search object
     * @throws When args.input is not an object
     */
    async function find(source, args) {
        try {
            let user = await auth.getUser(args.input.uid);
            return user;
        } catch (ex) {
            if (ex.code === `auth/user-not-found`) {
                return undefined;
            } else {
                throw ex;
            }
        }
    }
};
