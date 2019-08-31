module.exports = createAuthenticateHandler;

function createAuthenticateHandler(rest) {
    return authenticate;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.input.email The user's email
     * @param {object} args.input.password The user's password
     * @param {object} args.input.token A token to use to login
     */
    async function authenticate(source, args) {
        if (typeof args.input.email === `string` && typeof args.input.password === `string`) {
            const tokenData = await rest.verifyPassword(args.input.email, args.input.password);
            if (tokenData) {
                tokenData.uid = tokenData.localId;
                delete tokenData.localId;
            }
            return tokenData;
        } else if (typeof args.input.token === `string`) {
            const tokenData = await rest.verifyCustomToken(args.input.token);
            if (tokenData) {
                tokenData.uid = tokenData.userId;
                delete tokenData.userId;
            }
            return tokenData;
        } else {
            throw new Error(`Either email and password must be supplied a customToken as "token"`);
        }
    }
}
