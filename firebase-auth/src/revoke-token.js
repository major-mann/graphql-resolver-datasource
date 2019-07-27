module.exports = function createRevokeTokenHandler(auth) {
    return revokeToken;

    /**
     * Revokes all tokens for a given uid
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.uid The user id to revoke the tokens for
     */
    async function revokeToken(source, args) {
        await auth.revokeRefreshTokens(args.uid);
    }
};
