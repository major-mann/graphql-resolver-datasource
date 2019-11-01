module.exports = createSendOobCodeMail;

const SEND_OOB_CODE_MAIL_URI = apiKey => `https://identitytoolkit.googleapis.com/v1` +
    `/accounts:sendOobCode?key=${apiKey}`;

const ConsumerError = require(`../consumer-error.js`);
const { post } = require(`./common.js`);

function createSendOobCodeMail(apiKey) {
    const sendOobCodeMailUri = SEND_OOB_CODE_MAIL_URI(apiKey);
    return sendOobCodeMail;

    async function sendOobCodeMail(type, email, locale) {
        try {
            const headers = locale && { 'x-firebase-locale': locale };
            const response = await post(sendOobCodeMailUri, {
                email,
                requestType: type
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
