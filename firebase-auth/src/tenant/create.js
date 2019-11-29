module.exports = createTenantCreateHandler;

function createTenantCreateHandler(loadAuth) {
    return create;

    /**
     * Creates a new record in the data source.
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     */
    async function create(source, args) {
        const auth = await loadAuth();
        const tenantManager = auth.tenantManager();
        const tenant = await tenantManager.createTenant(args.input);
        return tenant;
    }
}
