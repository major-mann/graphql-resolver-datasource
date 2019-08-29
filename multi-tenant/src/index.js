module.exports = createMultiTenantDatasource;

function createMultiTenantDatasource(tenantSource, createDatasource, resolverNames, keyNames) {
    return Object.fromEntries(
        resolverNames.map(name => [name, createMultiTenantResolver(name)])
    );

    function createMultiTenantResolver(name) {
        if (name === `list`) {
            return list;
        } else {
            return multiTenantResolver;
        }
        async function multiTenantResolver(source, args, context, info) {
            const shardInfo = await tenantSource.find(
                source,
                args,
                context,
                info
            );
            const datasource = await createDatasource(shardInfo);
            if (!datasource) {
                throw new Error(`Unable to determine ${name} tenant datasource for input`);
            }
            const result = await datasource[name](source, args, context, info);
            return result;
        }
    }

    async function list(source, args, context, info) {
        ensureTenantKeys(args && args.input && args.input.filter);

        const tenantFilters = args && args.input && args.input.filter
            .filter(filter => keyNames.includes(filter.field));

        const shardInfoList = await tenantSource.list(
            source,
            buildArgs(tenantFilters),
            context,
            info
        );

        const shardInfo = shardInfoList.egdes.map(edge => edge.node)[0];
        const datasource = await createDatasource(shardInfo);
        if (!datasource) {
            throw new Error(`Unable to determine list tenant datasource for input`);
        }
        return datasource.list(source, args, context, info);

        function ensureTenantKeys(filter) {
            if (filter && Array.isArray(filter)) {
                if (keyNames.every(name => filter.find(f => f.field === name && f.op === `EQ`))) {
                    return;
                }
            }
            throw new Error(`args.input.filter MUST contain all tenant key names with the EQ operation`);
        }

        function buildArgs(filter) {
            return {
                ...args,
                input: {
                    ...(args && args.input),
                    filter
                }
            };
        }
    }
}