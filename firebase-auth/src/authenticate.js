module.exports = function createAuthenticateHandler(rest) {
    return authenticate;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.email The user's email
     * @param {object} args.password The user's password
     * @param {object} args.token A token to use to login
     */
    async function authenticate(source, args) {
        let tokenData;
        if (typeof args.email === `string` && typeof args.password === `string`) {
            tokenData = await rest.verifyPassword(args.email, args.password);
            if (tokenData) {
                tokenData.userId = tokenData.localId;
                delete tokenData.localId;
            }
        } else if (typeof args.token === `string`) {
            tokenData = await rest.verifyCustomToken(args.token);
        } else {
            throw new Error(`Either email and password must be supplied or "customToken"`);
        }
        return tokenData;
    }
};
