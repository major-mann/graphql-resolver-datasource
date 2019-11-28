module.exports = function createRevokeTokenHandler(loadAuth) {
    return revokeToken;

    /**
     * Revokes all tokens for a given uid
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.input.uid The user id to revoke the tokens for
     * @param {object} args.input.tenantId The tenant to revoke the token for
     */
    async function revokeToken(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        await auth.revokeRefreshTokens(args.input.uid);
    }
};
