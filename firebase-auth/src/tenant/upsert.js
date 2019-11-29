module.exports = createTenantUpsertHandler;

function createTenantUpsertHandler() {
    return upsert;

    /** Not supported */
    async function upsert() {
        throw new Error(`Tenant upsert is not supported`);
    }
}
