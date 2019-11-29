module.exports = createUpdateTenantValidator;

const assert = require(`assert`);

async function createUpdateTenantValidator(resolvers, source, context, info) {
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-1`
            }
        }, context, info);
        cleanup.push(document1.tenantId);

        const updated = await resolvers.tenantUpdate(source, {
            input: {
                tenantId: document1.tenantId,
                displayName: `test-tenant-2`
            }
        }, context, info);

        assert(updated, `Expected the updated document to be returned`);
        assert.equal(updated.tenantId, document1.tenantId);
        assert.equal(updated.displayName, `test-tenant-2`);
        result = true;
    } catch (ex) {
        console.error(`Update validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            tenantId => resolvers.tenantDelete(source, { input: { tenantId } }, context, info)
        )
    );
    return result;
}
