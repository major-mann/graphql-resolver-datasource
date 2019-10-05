module.exports = createTokenCreationHandler;

function createTokenCreationHandler(auth, rest) {
    return createToken;

    /**
     * Creates a token for the supplied userId
     * @param {*} source Unused
     * @param {object} args The arguments to create id token with
     * @param {object} args.input.userId The user's unique identifier
     */
    async function createToken(source, args) {
        const customToken = await auth.createCustomToken(args.input.uid);
        const tokenData = await rest.verifyCustomToken(customToken);
        if (tokenData) {
            tokenData.uid = tokenData.userId;
            delete tokenData.userId;
        }
        return tokenData;
    }
}
