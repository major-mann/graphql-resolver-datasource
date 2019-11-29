module.exports = createTenantUpdateHandler;

function createTenantUpdateHandler(loadAuth) {
    return update;

    /**
     * Updates a tenant
     * @param {*} source Unused
     * @param {object} args The arguments to update with.
     * @param {object} args.input The updated values
     */
    async function update(source, args) {
        const auth = await loadAuth();
        const tenantManager = auth.tenantManager();
        const { tenantId, ...input } = args.input;
        const tenant = await tenantManager.updateTenant(tenantId, input);
        return tenant;
    }
}
