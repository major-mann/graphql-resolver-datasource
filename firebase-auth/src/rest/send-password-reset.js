module.exports = createSendPasswordResetMail;

const createSendOobCode = require(`./send-oob-code.js`);

function createSendPasswordResetMail(apiKey) {
    const sendPasswordResetMail = createSendOobCode(apiKey);
    return (email, locale) => sendPasswordResetMail(`PASSWORD_RESET`, email, locale);
}
