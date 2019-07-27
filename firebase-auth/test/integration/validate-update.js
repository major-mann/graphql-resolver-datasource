module.exports = createUpdateValidator;

const assert = require(`assert`);

async function createUpdateValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                email: `michael-cain@example.com`,
                disabled: true
            }
        }, context, info);
        cleanup.push(document1.uid);

        const updated = await resolvers.update(source, {
            input: {
                uid: document1.uid,
                disabled: false
            }
        }, context, info);

        assert(updated, `Expected the updated document to be returned`);
        assert.equal(updated.uid, document1.uid);
        assert.equal(updated.email, document1.email);
        assert.equal(updated.disabled, !document1.disabled);

        result = true;
    } catch (ex) {
        console.error(`Update validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid } }, context, info)
        )
    );
    return result;
}
