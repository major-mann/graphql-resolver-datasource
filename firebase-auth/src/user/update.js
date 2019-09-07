module.exports = createUpdateHandler;

const { shouldCallUpsert } = require(`./common.js`);

function createUpdateHandler(auth, find, upsert) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @throws When args.input is not an object, when the document to update cannot be found
     */
    async function update(source, args, context, info) {
        const shouldUpsert = shouldCallUpsert(args.input);
        if (shouldUpsert) {
            const existing = await find(source, args, context, info);
            const input = {
                ...existing,
                ...args.input
            };
            const result = await upsert(source, { input }, context, info);
            return result;
        } else {
            const [user] = await Promise.all([
                auth.updateUser(args.input.uid, args.input),
                args.input.customClaims && auth.setCustomUserClaims(
                    args.input.uid,
                    args.input.customClaims
                )
            ]);
            return user;
        }
    }

}
