module.exports = createRestInterface;

const VERIFY_PASSWORD_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword` +
    `?key=${encodeURIComponent(apiKey)}`;
const VERIFY_CUSTOM_TOKEN_URI = apiKey => `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken` +
    `?key=${apiKey}`;
const REFRESH_ID_TOKEN_URI = apiKey => `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

const fetch = require(`node-fetch`);
const ConsumerError = require(`./consumer-error.js`);

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
        try {
            const response = await post(verifyPasswordUri, {
                email,
                password,
                returnSecureToken: true
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `EMAIL_NOT_FOUND`:
                    throw new ConsumerError(
                        `There is no user record corresponding to this email. The user may have been deleted`,
                        `auth/user-not-found`
                    );
                case `INVALID_PASSWORD`:
                    throw new ConsumerError(
                        `The password is invalid or the user does not have a password`,
                        `auth/invalid-password`
                    );
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The user account has been disabled by an administrator`,
                        `auth/user-disabled`
                    );
                default:
                    throw ex;
            }
        }
    }

    async function verifyCustomToken(token) {
        try {
            const response = await post(verifyCustomTokenUri, {
                token,
                returnSecureToken: true
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `INVALID_CUSTOM_TOKEN`:
                case `CREDENTIAL_MISMATCH`:
                    throw new ConsumerError(
                        `The supplied token is either malformed or not valid for this project`,
                        `auth/invalid-custom-token`
                    );
                default:
                    throw ex;
            }
        }
    }

    async function refreshIdToken(refreshToken) {
        try {
            const response = await post(refreshIdTokenUri, {
                grant_type: `refresh_token`,
                refresh_token: refreshToken
            });
            return response;
        } catch (ex) {
            switch (ex.code) {
                case `TOKEN_EXPIRED`:
                    throw new ConsumerError(
                        `The user's credential is no longer valid. The user must sign in again`,
                        `auth/id-token-expired`
                    );
                case `USER_DISABLED`:
                    throw new ConsumerError(
                        `The user account has been disabled by an administrator`,
                        `auth/user-disabled`
                    );
                case `USER_NOT_FOUND`:
                    throw new ConsumerError(
                        `The user corresponding to the refresh token was not found. It is likely the user was deleted`,
                        `auth/user-not-found`
                    );
                case `INVALID_REFRESH_TOKEN`:
                    throw new ConsumerError(
                        `An invalid refresh token was provided`,
                        `auth/invalid-refresh-token`
                    );
                default:
                    throw ex;
            }
        }
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

        if (response.ok) {
            const body = await response.json();
            return body;
        }

        // All the rest is for error handling
        if (!isJson(response.headers.get(`content-type`))) {
            const err = new Error(await response.text());
            err.code = response.status;
            throw err;
        }

        // Standard error format
        const body = await response.json();
        if (!body || !body.error) {
            throw new Error(`An unknow error occured while posting to "${uri}". ${JSON.stringify(body)}`);
        }

        const err = new Error(`An error occured with firebase auth rest API at endpoint "${uri}"`);
        err.code = body.error.message;
        err.errors = body.errors;
        throw err;
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
