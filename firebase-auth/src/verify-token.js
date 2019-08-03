module.exports = function createVerifyTokenHandler(auth, rest) {
    return verifyToken;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {string} args.input.id The id token to verify
     * @param {string} args.input.session The session token to verify
     * @param {string} args.input.custom The custom token to verify
     * @param {string} args.input.checkRevoked Whether to make a call to the authotization
     *  server to check whether the token has been revoked (valid for id and session
     *  tokens)
     */
    async function verifyToken(source, args) {
        if (args.input.id) {
            const claims = await auth.verifyIdToken(args.input.idToken, Boolean(args.input.checkRevoked));
            return claims;
        } else if (args.input.session) {
            const claims = await auth.verifySessionCookie(args.input.sessionToken, Boolean(args.input.checkRevoked));
            return claims;
        } else if (args.input.custom) {
            const claims = await rest.verifyCustomToken(args.input.custom);
            return claims;
        } else {
            throw new Error(`MUST supply a token to validate`);
        }
    }
};
