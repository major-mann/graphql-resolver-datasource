module.exports = createConfirmEmailVerify;

const CONFIRM_EMAIL_VERIFY_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:update?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createConfirmEmailVerify(apiKey) {
    return confirmEmailVerify;

    async function confirmEmailVerify(tenantId, oobCode) {
        const confirmEmailVerifyUri = CONFIRM_EMAIL_VERIFY_URI(apiKey);
        try {
            const response = await post(confirmEmailVerifyUri, {
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
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The account associated with the oob code is disabled`,
                        `auth/user-disabled`
                    );
                case `EMAIL_NOT_FOUND`:
                    throw new ConsumerError(
                        `The account associated with the oob code does not exist. It may have been deleted`,
                        `auth/user-not-found`
                    );
                default:
                    throw ex;
            }
        }
    }
}
