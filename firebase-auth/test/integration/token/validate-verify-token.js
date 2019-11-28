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
        assert(typeof tokenData.idToken === `string`, `Expected id token to be returned`);

        await resolvers.verifyToken(source, {
            input: {
                idToken: tokenData.idToken,
                tenantId
            }
        }, context, info);

        let verified = false;
        try {
            await resolvers.verifyToken(source, {
                input: {
                    idToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9l` +
                        `IiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
                    tenantId
                }
            }, context, info);
            verified = true;
        } catch (ex) {
            // Do nothing
        }
        assert(!verified, `Expected token data to be rejected`);


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
