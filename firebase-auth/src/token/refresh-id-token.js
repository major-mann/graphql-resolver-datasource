module.exports = createRefreshIdTokenHandler;

function createRefreshIdTokenHandler(rest) {
    return refreshIdToken;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.input.refreshToken The refresh token
     * @param {object} args.input.tenantId The tenant the token belongs to
     */
    async function refreshIdToken(source, args) {
        const refreshTokenData = await rest.refreshIdToken(
            args.input.tenantId,
            args.input.refreshToken
        );
        return {
            uid: refreshTokenData.user_id,
            idToken: refreshTokenData.id_token,
            refreshToken: refreshTokenData.refresh_token,
            expiresIn: parseInt(refreshTokenData.expires_in),
            tokenType: refreshTokenData.token_type,
            projectId: refreshTokenData.project_id
        };
    }
}
