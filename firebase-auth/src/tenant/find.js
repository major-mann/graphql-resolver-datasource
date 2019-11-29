module.exports = createTenantFindHandler;

function createTenantFindHandler(loadAuth) {
    return find;

    /**
     * Searches for a tenant
     * @param {*} source Unused
     * @param {object} args The arguments to search with
     * @param {object} args.input The search parameters
     * @param {object} args.input.tenantId The id of the tenant to find
     */
    async function find(source, args) {
        const auth = await loadAuth();
        const tenantManager = auth.tenantManager();
        try {
            const tenant = await tenantManager.getTenant(args.input.tenantId);
            return tenant;
        } catch (ex) {
            if (ex.code === `auth/tenant-not-found`) {
                return undefined;
            } else {
                throw ex;
            }
        }
    }
}
