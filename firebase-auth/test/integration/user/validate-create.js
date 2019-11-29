module.exports = createCreateValidator;

const assert = require(`assert`);

async function createCreateValidator(resolvers, source, context, info, tenantId) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                tenantId,
                email: `clint-eastwood@example.com`
            }
        }, context, info);
        cleanup.push(document1.uid);

        assert(document1, `Expected the created document to be returned`);
        assert(document1.uid, `Expected uid to be generated`);
        assert.equal(document1.email, `clint-eastwood@example.com`);

        result = true;
    } catch (ex) {
        console.error(`Create validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
