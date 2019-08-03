module.exports = createRestInterface;

const VERIFY_PASSWORD_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword` +
    `?key=${encodeURIComponent(apiKey)}`;
const VERIFY_CUSTOM_TOKEN_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken` +
    `?key=${apiKey}`;
const REFRESH_ID_TOKEN_URI = apiKey => `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

const fetch = require(`node-fetch`);

function createRestInterface(apiKey) {
    const verifyPasswordUri = VERIFY_PASSWORD_URI(apiKey);
    const verifyCustomTokenUri = VERIFY_CUSTOM_TOKEN_URI(apiKey);
    const refreshIdTokenUri = REFRESH_ID_TOKEN_URI(apiKey);

    return {
        refreshIdToken,
        verifyPassword,
        verifyCustomToken
    };

    async function verifyPassword(email, password) {
        const response = await post(verifyPasswordUri, {
            email,
            password,
            returnSecureToken: true
        });
        return response;
    }

    async function verifyCustomToken(token) {
        const response = await post(verifyCustomTokenUri, {
            token,
            returnSecureToken: true
        });
        return response;
    }

    async function refreshIdToken(refreshToken) {
        const response = await post(refreshIdTokenUri, {
            grant_type: `refresh_token`,
            refresh_token: refreshToken
        });
        return response;
    }

    async function post(uri, data) {
        if (!apiKey) {
            throw new Error(`No API key available. Unable to make call to API`);
        }

        const response = await fetch(uri, {
            method: `POST`,
            headers: { 'content-type': `application/json` },
            body: JSON.stringify(data)
        });

        const body = isJson(response.headers.get(`content-type`)) ?
            await response.json() :
            await response.text();

        if (response.ok) {
            return body;
        } else if (body && typeof body === `object`) {
            let errBody = body;
            if (body.error && typeof body.error === `object`) {
                errBody = body.error;
            }
            throw Object.assign(new Error(errBody.message), errBody);
        } else {
            throw new Error(body);
        }
    }

    function isJson(contentType) {
        if (contentType) {
            const [type] = contentType.split(`;`);
            return type && type.trim() === `application/json`;
        } else {
            return false;
        }
    }
}
