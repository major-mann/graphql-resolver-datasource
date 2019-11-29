module.exports = createDeleteTenantValidator;

const assert = require(`assert`);

async function createDeleteTenantValidator(resolvers, source, context, info) {
    try {
        const document1 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant`
            }
        }, context, info);

        const result = await resolvers.tenantDelete(
            source,
            { input: { tenantId: document1.tenantId } },
            context,
            info
        );

        assert.deepStrictEqual(result, document1);

        const remaining = await resolvers.tenantFind(
            source,
            { input: { tenantId: document1.tenantId } },
            context,
            info
        );
        assert(!remaining, `The tenant with id "${document1.tenantId}" was not deleted`);

        return true;
    } catch (ex) {
        console.error(`Delete validation failed. ${ex.stack}`); // eslint-disable-line no-console
        return false;
    }
}
