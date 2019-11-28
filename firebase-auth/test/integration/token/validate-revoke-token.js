module.exports = validateRevokeToken;

const assert = require(`assert`);
const uuid = require(`uuid`);

async function validateRevokeToken(resolvers, source, context, info, tenantId) {
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

        assert(typeof tokenData.refreshToken === `string`, `Expected refresh token to be returned`);
        assert(typeof tokenData.idToken === `string`, `Expected id token to be returned`);

        const refreshedTokenData = await resolvers.refreshIdToken(source, {
            input: {
                refreshToken: tokenData.refreshToken,
                tenantId
            }
        }, context, info);

        assert(typeof refreshedTokenData.refreshToken === `string`, `Expected refresh token to be returned`);
        assert(typeof refreshedTokenData.idToken === `string`, `Expected id token to be returned`);

        await resolvers.revokeToken(source, {
            input: {
                tenantId,
                uid: document1.uid
            }
        }, context, info);

        let secondRefreshedTokenData;
        try {
            secondRefreshedTokenData = await resolvers.refreshIdToken(source, {
                input: {
                    refreshToken: refreshedTokenData.refreshToken,
                    tenantId
                }
            }, context, info);

        } catch (ex) {
            if (ex.code !== `auth/id-token-expired`) {
                throw ex;
            }
            // Do nothing
        }
        assert(!secondRefreshedTokenData, `Expected refresh after revocation to fail`);
        result = true;
    } catch (ex) {
        console.error(`Refresh token validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
