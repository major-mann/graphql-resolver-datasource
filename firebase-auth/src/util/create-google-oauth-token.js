module.exports = createGoogleOathToken;

const DEFAULT_SCOPES = [`https://www.googleapis.com/auth/cloud-platform`];

const { google } = require(`googleapis`);

function createGoogleOathToken(serviceAccount) {
    return new Promise(function promiseHandler(resolve, reject) {
        // Authenticate a JWT client with the service account.
        const jwtClient = new google.auth.JWT(
            serviceAccount.client_email,
            null,
            serviceAccount.private_key,
            DEFAULT_SCOPES
        );

        // Use the JWT client to generate an access token.
        jwtClient.authorize(function onAuthorized(err, tokens) {
            if (err) {
                reject(err);
            } else if (tokens.access_token) {
                resolve(tokens.access_token);
            } else {
                reject(new Error(`Provided service account does not have permission to generate access tokens`));
            }
        });
    });
}
