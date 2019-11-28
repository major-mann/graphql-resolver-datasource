module.exports = createVerifyTokenHandler;

const ConsumerError = require(`../consumer-error.js`);

function createVerifyTokenHandler(loadAuth) {
    return verifyToken;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {string} args.input.idToken The id token to verify
     * @param {string} args.input.checkRevoked Whether to make a call to the authotization
     * @param {string} args.input.tenantId The tenant to verify the token for
     *  server to check whether the token has been revoked (valid for id and session
     *  tokens)
     */
    async function verifyToken(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        if (args.input.idToken) {
            const claims = await auth.verifyIdToken(args.input.idToken, Boolean(args.input.checkRevoked));
            return claims;
        } else {
            throw new ConsumerError(`MUST supply a token to validate`);
        }
    }
}
