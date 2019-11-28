module.exports = createVerifyCustomToken;

const VERIFY_CUSTOM_TOKEN_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:signInWithCustomToken?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createVerifyCustomToken(apiKey) {
    return verifyCustomToken;

    async function verifyCustomToken(tenantId, token) {
        const verifyCustomTokenUri = VERIFY_CUSTOM_TOKEN_URI(apiKey);
        try {
            const response = await post(verifyCustomTokenUri, {
                token,
                tenantId,
                returnSecureToken: true
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `INVALID_CUSTOM_TOKEN`:
                case `CREDENTIAL_MISMATCH`:
                    throw new ConsumerError(
                        `The supplied token is either malformed or not valid for this project`,
                        `auth/invalid-custom-token`
                    );
                default:
                    throw ex;
            }
        }
    }
}
