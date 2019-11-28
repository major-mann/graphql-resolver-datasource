module.exports = createTokenCreationHandler;

const SIGNING_ALGORITHM = `RS256`;
const CUSTOM_TOKEN_AUDIENCE = `https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit`;

const jwt = require(`jsonwebtoken`);

function createTokenCreationHandler(serviceAccount, rest) {
    return createToken;

    /**
     * Creates a token for the supplied userId
     * @param {*} source Unused
     * @param {object} args The arguments to create id token with
     * @param {object} args.input.userId The user's unique identifier
     * @param {object} args.input.tenantId The id of the tenant to create the token for
     */
    async function createToken(source, args) {
        const customToken = jwt.sign({
            sub: serviceAccount.client_email,
            uid: args.input.uid,
            tenant_id: args.input.tenantId
        }, serviceAccount.private_key, {
            audience: CUSTOM_TOKEN_AUDIENCE,
            issuer: serviceAccount.client_email,
            algorithm: SIGNING_ALGORITHM,
            expiresIn: 0
        });

        const tokenData = await rest.verifyCustomToken(
            args.input.tenantId,
            customToken
        );

        if (tokenData) {
            tokenData.uid = args.input.uid;
            delete tokenData.userId;
        }
        return tokenData;
    }
}
