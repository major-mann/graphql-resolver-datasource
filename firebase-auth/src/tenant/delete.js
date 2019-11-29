module.exports = createTenantDeleteHandler;

function createTenantDeleteHandler(loadAuth, find) {
    return deleteTenant;

    /**
     * Updates a tenant
     * @param {*} source Unused
     * @param {object} args The arguments to delete with.
     * @param {object} args.input The deleted values
     */
    async function deleteTenant(source, args, context, info) {
        const auth = await loadAuth();
        const tenantManager = auth.tenantManager();
        const tenant = await find(source, args, context, info);
        if (tenant) {
            await tenantManager.deleteTenant(tenant.tenantId);
        }
        return tenant;
    }
}
