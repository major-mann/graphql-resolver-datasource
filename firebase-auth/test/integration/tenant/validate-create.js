module.exports = createCreateTenantValidator;

const assert = require(`assert`);

async function createCreateTenantValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant`
            }
        }, context, info);
        cleanup.push(document1.tenantId);

        assert(document1, `Expected the created document to be returned`);
        assert(document1.tenantId, `Expected tenantId to be generated`);
        assert.equal(document1.displayName, `test-tenant`);

        result = true;
    } catch (ex) {
        console.error(`Create tenant validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            tenantId => resolvers.tenantDelete(source, { input: { tenantId } }, context, info)
        )
    );
    return result;
}
