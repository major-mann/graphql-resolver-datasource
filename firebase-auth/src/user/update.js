module.exports = createUpdateHandler;

const { shouldCallUpsert, plainUserObject, sanitizeUserInput } = require(`./common.js`);

function createUpdateHandler(loadAuth, find, upsert) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @throws When args.input is not an object, when the document to update cannot be found
     */
    async function update(source, args, context, info) {
        const auth = await loadAuth(args.input.tenantId);
        const shouldUpsert = shouldCallUpsert(args.input);
        if (shouldUpsert) {
            const existing = await find(source, args, context, info);
            // We delete these since they will cause the upsert to fail,
            //  and we have entered this block because we have a supplied
            //  password or password hash, so these are not required.
            delete existing.passwordHash;
            delete existing.passwordSalt;
            const input = {
                ...existing,
                ...args.input
            };
            const result = await upsert(source, { input }, context, info);
            return result;
        } else {
            const [user] = await Promise.all([
                auth.updateUser(args.input.uid, sanitizeUserInput(args.input)),
                args.input.customClaims && auth.setCustomUserClaims(
                    args.input.uid,
                    args.input.customClaims
                )
            ]);
            return plainUserObject(user);
        }
    }

}
