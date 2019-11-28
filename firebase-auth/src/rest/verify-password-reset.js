module.exports = createVerifyPasswordResetCode;

const VERIFY_PASSWORD_RESET_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:resetPassword?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createVerifyPasswordResetCode(apiKey) {
    return verifyPasswordResetCode;

    async function verifyPasswordResetCode(tenantId, oobCode) {
        const verifyPasswordResetCodeUri = VERIFY_PASSWORD_RESET_URI(apiKey);
        try {
            const response = await post(verifyPasswordResetCodeUri, {
                tenantId,
                oobCode
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `EXPIRED_OOB_CODE`:
                    throw new ConsumerError(
                        `The supplied code has expired`,
                        `auth/oob-code-expired`
                    );
                case `INVALID_OOB_CODE`:
                    throw new ConsumerError(
                        `The supplied code is invalid`,
                        `auth/oob-code-invalid`
                    );
                default:
                    throw ex;
            }
        }
    }
}
