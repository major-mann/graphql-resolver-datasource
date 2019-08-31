module.exports = createRestInterface;

const createRefreshIdToken = require(`./refresh-id-token.js`);
const createSendPasswordReset = require(`./send-password-reset.js`);
const createVerifyPasswordReset = require(`./verify-password-reset.js`);
const createConfirmPasswordReset = require(`./confirm-password-reset.js`);
const createSendEmailVerification = require(`./send-email-verify.js`);
const createConfirmEmailVerification = require(`./confirm-email-verify.js`);
const createVerifyCustomToken = require(`./verify-custom-token.js`);
const createVerifyPassword = require(`./verify-password.js`);

function createRestInterface(apiKey) {
    return {
        refreshIdToken: createRefreshIdToken(apiKey),
        sendPasswordReset: createSendPasswordReset(apiKey),
        verifyPasswordReset: createVerifyPasswordReset(apiKey),
        confirmPasswordReset: createConfirmPasswordReset(apiKey),
        sendEmailVerification: createSendEmailVerification(apiKey),
        confirmEmailVerification: createConfirmEmailVerification(apiKey),
        verifyCustomToken: createVerifyCustomToken(apiKey),
        verifyPassword: createVerifyPassword(apiKey)
    };
}
