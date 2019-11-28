module.exports = validateCreateToken;

const assert = require(`assert`);
const uuid = require(`uuid`);

async function validateCreateToken(resolvers, source, context, info, tenantId) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const email = `clint-eastwood@example.com`;
        const password = uuid.v4();
        const document1 = await resolvers.create(source, {
            input: {
                tenantId,
                email,
                password
            }
        }, context, info);
        cleanup.push(document1.uid);

        assert(document1, `Expected the created document to be returned`);
        assert(document1.uid, `Expected uid to be generated`);
        assert.equal(document1.email, `clint-eastwood@example.com`);

        const tokenData = await resolvers.createToken(source, {
            input: {
                uid: document1.uid,
                tenantId
            }
        }, context, info);
        assert(tokenData, `Expected token data to be returned`);
        assert.equal(tokenData.uid, document1.uid, `Expected token uid to match user`);
        assert(tokenData.expiresIn > 0, `Expected expiresIn to be a number greater than 0`);
        assert(typeof tokenData.refreshToken === `string`, `Expected refresh token to be returned`);
        assert(typeof tokenData.idToken === `string`, `Expected id token to be returned`);

        result = true;
    } catch (ex) {
        console.error(`Authenticate validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
