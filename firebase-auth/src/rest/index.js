module.exports = createRestInterface;

const createRefreshIdToken = require(`./refresh-id-token.js`);
const createSendPasswordResetMail = require(`./send-password-reset-mail.js`);
const createVerifyCustomToken = require(`./verify-custom-token.js`);
const createVerifyPassword = require(`./verify-password.js`);

function createRestInterface(apiKey) {
    return {
        refreshIdToken: createRefreshIdToken(apiKey),
        sendPasswordResetMail: createSendPasswordResetMail(apiKey),
        verifyCustomToken: createVerifyCustomToken(apiKey),
        verifyPassword: createVerifyPassword(apiKey)
    };
}
