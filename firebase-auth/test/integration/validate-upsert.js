module.exports = createUpsertValidator;

const assert = require(`assert`);

async function createUpsertValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.upsert(source, {
            input: {
                uid: `morgan-freeman`,
                email: `morgan-freeman@example.com`,
                password: `******`,
                disabled: true
            }
        }, context, info);
        cleanup.push(document1.uid);

        assert(document1, `Expected the upserted document to be returned`);
        assert.equal(document1.email, `morgan-freeman@example.com`);

        const document2 = await resolvers.upsert(source, {
            input: {
                uid: document1.uid,
                email: document1.email,
                emailVerified: false,
                password: `******`
            }
        }, context, info);

        const found = await resolvers.find(
            source,
            { input: { uid: document1.uid } },
            context,
            info
        );
        assert(found, `Expected document to exist`);
        assert(!found.nickname, `Expected document to have been replaced`);
        assert.equal(found.uid, document2.uid);
        assert.equal(found.email, document2.email);
        assert.equal(found.disabled, false);
        result = true;
    } catch (ex) {
        console.error(`Upsert validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid } }, context, info)
        )
    );
    return result;
}
