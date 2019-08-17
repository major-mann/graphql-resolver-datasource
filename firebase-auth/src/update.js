module.exports = createUpdateHandler;

function createUpdateHandler(auth) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @throws When args.input is not an object, when the document to update cannot be found
     */
    async function update(source, args) {
        if (!args.input) {
            throw new Error(`No input value supplied in args`);
        }
        const [user] = await Promise.all([
            auth.updateUser(args.input.uid, args.input),
            args.input.claims && auth.setCustomUserClaims(args.input.uid, args.input.claims)
        ]);
        return user;
    }

}
