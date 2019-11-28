module.exports = createRefreshIdToken;

const REFRESH_ID_TOKEN_URI = apiKey => `https://securetoken.googleapis.com/v1/token` +
    `?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createRefreshIdToken(apiKey) {
    return refreshIdToken;

    async function refreshIdToken(tenantId, refreshToken) {
        const refreshIdTokenUri = REFRESH_ID_TOKEN_URI(apiKey);
        try {
            const response = await post(refreshIdTokenUri, {
                grant_type: `refresh_token`,
                refresh_token: refreshToken,
                tenantId
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `TOKEN_EXPIRED`:
                    throw new ConsumerError(
                        `The user's credential is no longer valid. The user must sign in again`,
                        `auth/id-token-expired`
                    );
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The user account has been disabled by an administrator`,
                        `auth/user-disabled`
                    );
                case `USER_NOT_FOUND`:
                    throw new ConsumerError(
                        `The user corresponding to the refresh token was not found. It is likely the user was deleted`,
                        `auth/user-not-found`
                    );
                case `INVALID_REFRESH_TOKEN`:
                    throw new ConsumerError(
                        `An invalid refresh token was provided`,
                        `auth/invalid-refresh-token`
                    );
                default:
                    throw ex;
            }
        }
    }
}
