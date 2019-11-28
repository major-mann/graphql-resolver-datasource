module.exports = createSendVerifyEmailMail;

const createSendOobCode = require(`./send-oob-code.js`);

function createSendVerifyEmailMail(apiKey) {
    const sendVerifyEmailMail = createSendOobCode(apiKey);
    return (tenantId, email, locale) => sendVerifyEmailMail(tenantId, `VERIFY_EMAIL`, email, locale);
}
