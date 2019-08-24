module.exports = createSendPasswordResetMail;

const SEND_PASSWORD_RESET_MAIL_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:sendOobCode?key=${apiKey}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createSendPasswordResetMail(apiKey) {
    const sendPasswordResetMailUri = SEND_PASSWORD_RESET_MAIL_URI(apiKey);
    return sendPasswordResetMail;

    async function sendPasswordResetMail(email, locale) {
        try {
            const headers = locale && { 'x-firebase-Locale': locale };
            const response = await post(sendPasswordResetMailUri, {
                email,
                requestType: `PASSWORD_RESET`
            }, headers);
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `EMAIL_NOT_FOUND`:
                    throw new ConsumerError(
                        `The user corresponding to the email "${email}" was not found. ` +
                            `It is possible the user was deleted`,
                        `auth/user-not-found`
                    );
                default:
                    throw ex;
            }
        }
    }
}
