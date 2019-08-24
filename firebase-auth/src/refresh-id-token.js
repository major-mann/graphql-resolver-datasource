module.exports = createRefreshIdTokenHandler;

function createRefreshIdTokenHandler(rest) {
    return refreshIdToken;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to refresh the id token with
     * @param {object} args.input The refresh token
     */
    async function refreshIdToken(source, args) {
        const refreshTokenData = await rest.refreshIdToken(args.input);
        return {
            idToken: refreshTokenData.id_token,
            refreshToken: refreshTokenData.refresh_token,
            expiresIn: parseInt(refreshTokenData.expires_in),
            tokenType: refreshTokenData.token_type,
            userId: refreshTokenData.user_id,
            projectId: refreshTokenData.project_id
        };
    }
}
