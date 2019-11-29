module.exports = createTenantListHandler;

const createPageTokenList = require(`@major-mann/graphql-resolver-datasource-util-page-token-list`);
const ConsumerError = require(`../consumer-error.js`);

function createTenantListHandler(loadAuth) {
    return createPageTokenList({
        sourceName: `firebase-auth-tenant`,
        lookup,
        listHandler,
        convertOut: plainTenantObject
    });

    async function lookup(field, value) {
        let tenant;
        const auth = await loadAuth(undefined);
        switch (field) {
            case `tenantId`:
                tenant = await auth.tenantManager().getTenant(value);
                break;
            default:
                throw new ConsumerError(`Filtering on "${field}" not supported`);
        }
        return tenant;
    }

    async function listHandler(limit, cursor) {
        const auth = await loadAuth(undefined);
        const listResult = await auth.tenantManager()
            .listTenants(limit, cursor && cursor.list);
        return {
            data: listResult.tenants,
            pageToken: listResult.pageToken
        };
    }

    function plainTenantObject(tenant) {
        if (tenant && typeof tenant.toJSON === `function`) {
            return tenant.toJSON();
        } else {
            return tenant;
        }
    }
}

