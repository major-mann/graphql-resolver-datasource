module.exports = createConfirmPasswordReset;

const CONFIRM_PASSWORD_RESET_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:resetPassword?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createConfirmPasswordReset(apiKey) {
    return confirmPasswordReset;

    async function confirmPasswordReset(tenantId, oobCode, password) {
        const confirmPasswordResetUri = CONFIRM_PASSWORD_RESET_URI(apiKey);
        try {
            const response = await post(confirmPasswordResetUri, {
                oobCode,
                tenantId,
                newPassword: password
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
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The account associated with the oob code is disabled`,
                        `auth/user-disabled`
                    );
                default:
                    throw ex;
            }
        }
    }
}
