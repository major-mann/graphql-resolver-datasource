module.exports = createFindTenantValidator;

const assert = require(`assert`);

async function createFindTenantValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-1`
            }
        }, context, info);
        cleanup.push(document1.tenantId);

        const document2 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-2`
            }
        }, context, info);
        cleanup.push(document2.tenantId);

        const document3 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-3`
            }
        }, context, info);
        cleanup.push(document3.tenantId);

        const findResult1 = await resolvers.tenantFind(
            source,
            { input: { tenantId: document3.tenantId } },
            context,
            info
        );
        assert.deepStrictEqual(findResult1, document3);

        const findResult2 = await resolvers.tenantFind(
            source,
            { input: { tenantId: document1.tenantId } },
            context,
            info
        );
        assert.deepStrictEqual(findResult2, document1);

        const findResult3 = await resolvers.tenantFind(
            source,
            { input: { tenantId: `does-not-exist` } },
            context,
            info
        );
        assert.equal(findResult3, undefined);
        result = true;
    } catch (ex) {
        console.error(`Find validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            tenantId => resolvers.tenantDelete(
                source,
                { input: { tenantId } },
                context,
                info
            )
        )
    );
    return result;
}
