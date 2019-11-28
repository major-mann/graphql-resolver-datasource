module.exports = defaultWebAppConfig;

const fetch = require(`node-fetch`);

const FIREBASE_ADMIN_URL = process.env.FIREBASE_ADMIN_URL || `https://firebase.googleapis.com`;
const FIREBASE_DEFAULT_CONFIG_PATH = projectId => `/v1beta1/projects/${projectId}/webApps/-/config`;
const FIREBASE_DEFAULT_CONFIG = projectId => `${FIREBASE_ADMIN_URL}${FIREBASE_DEFAULT_CONFIG_PATH(projectId)}`;

async function defaultWebAppConfig(token, projectId) {
    const uri = FIREBASE_DEFAULT_CONFIG(projectId);
    const response = await fetch(uri, {
        method: `GET`,
        headers: {
            authorization: `Bearer ${token}`
        }
    });
    return await response.json();
}
