module.exports = loadWebConfig;

const createOauthToken = require(`./create-google-oauth-token.js`);
const loadDefaultSdkConfig = require(`./load-default-sdk-config.js`);

async function loadWebConfig(serviceAccount) {
    const token = await createOauthToken(serviceAccount);
    const webConfig = await loadDefaultSdkConfig(token, serviceAccount.project_id);
    return webConfig;
}
