module.exports = createSendVerifyEmailMail;

const createSendOobCode = require(`./send-oob-code.js`);

function createSendVerifyEmailMail(apiKey) {
    const sendVerifyEmailMail = createSendOobCode(apiKey);
    return (email, locale) => sendVerifyEmailMail(`VERIFY_EMAIL`, email, locale);
}
