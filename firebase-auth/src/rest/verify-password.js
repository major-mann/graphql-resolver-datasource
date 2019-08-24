module.exports = createVerifyPassword;

const VERIFY_PASSWORD_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3/` +
    `relyingparty/verifyPassword?key=${encodeURIComponent(apiKey)}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createVerifyPassword(apiKey) {
    const verifyPasswordUri = VERIFY_PASSWORD_URI(apiKey);
    return verifyPassword;

    async function verifyPassword(email, password) {
        try {
            const response = await post(verifyPasswordUri, {
                email,
                password,
                returnSecureToken: true
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `EMAIL_NOT_FOUND`:
                    throw new ConsumerError(
                        `There is no user record corresponding to this email. The user may have been deleted`,
                        `auth/user-not-found`
                    );
                case `INVALID_PASSWORD`:
                    throw new ConsumerError(
                        `The password is invalid or the user does not have a password`,
                        `auth/invalid-password`
                    );
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The user account has been disabled by an administrator`,
                        `auth/user-disabled`
                    );
                default:
                    throw ex;
            }
        }
    }
}
