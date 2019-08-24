module.exports = createVerifyCustomToken;

const VERIFY_CUSTOM_TOKEN_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3` +
    `/relyingparty/verifyCustomToken?key=${apiKey}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createVerifyCustomToken(apiKey) {
    const verifyCustomTokenUri = VERIFY_CUSTOM_TOKEN_URI(apiKey);
    return verifyCustomToken;

    async function verifyCustomToken(token) {
        try {
            const response = await post(verifyCustomTokenUri, {
                token,
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
