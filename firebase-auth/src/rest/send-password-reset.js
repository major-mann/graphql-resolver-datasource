module.exports = createSendPasswordResetMail;

const createSendOobCode = require(`./send-oob-code.js`);

function createSendPasswordResetMail(apiKey) {
    const sendPasswordResetMail = createSendOobCode(apiKey);
    return (tenantId, email, locale) => sendPasswordResetMail(tenantId, `PASSWORD_RESET`, email, locale);
}
