module.exports = function createVerifyTokenHandler(auth, rest) {
    return verifyToken;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {string} args.id The id token to verify
     * @param {string} args.session The session token to verify
     * @param {string} args.custom The custom token to verify
     * @param {string} args.checkRevoked Whether to make a call to the authotization
     *  server to check whether the token has been revoked (valid for id and session
     *  tokens)
     */
    async function verifyToken(source, args) {
        if (args.id) {
            const claims = await auth.verifyIdToken(args.idToken, Boolean(args.checkRevoked));
            return claims;
        } else if (args.session) {
            const claims = await auth.verifySessionCookie(args.sessionToken, Boolean(args.checkRevoked));
            return claims;
        } else if (args.custom) {
            const claims = await rest.verifyCustomToken(args.custom);
            return claims;
        } else {
            throw new Error(`MUST supply a token to validate`);
        }
    }
};
