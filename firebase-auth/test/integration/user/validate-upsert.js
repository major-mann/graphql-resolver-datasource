module.exports = createUpsertValidator;

const assert = require(`assert`);
const uuid = require(`uuid`);

async function createUpsertValidator(resolvers, source, context, info, tenantId) {
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                tenantId,
                email: `michael-cain@example.com`,
                disabled: true
            }
        }, context, info);
        cleanup.push(document1.uid);

        const upserted1 = await resolvers.upsert(source, {
            input: {
                tenantId,
                uid: document1.uid,
                email: `michael-cain@example.com`,
                disabled: false
            }
        }, context, info);

        assert(upserted1, `Expected the upserted document to be returned`);
        cleanup.push(upserted1.uid);
        assert.equal(upserted1.uid, document1.uid);
        assert.equal(upserted1.email, document1.email);
        assert.equal(upserted1.disabled, !document1.disabled);

        const uid = uuid.v4();
        cleanup.push(uid);
        const upserted2 = await resolvers.upsert(source, {
            input: {
                uid,
                tenantId,
                email: `morgan-freeman@example.com`,
                disabled: false
            }
        }, context, info);

        assert(upserted2, `Expected the upserted document to be returned`);
        assert.equal(upserted2.uid, uid);
        assert.equal(upserted2.email, `morgan-freeman@example.com`);
        assert.equal(upserted2.disabled, false);

        result = true;
    } catch (ex) {
        console.error(`Upsert validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
