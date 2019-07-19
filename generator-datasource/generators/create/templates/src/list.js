module.exports = function createListHandler(key, shape) {
    return list;

    /**
     * Lists the records applying and supplied order and filter instructions, and optionally paging
     * @param {*} source Unused
     * @param {object} args The arguments to use to determine what to list
     * @param {number} args.first Limit the returned number of records from the start
     * @param {number} args.last Limit the returned number of records from the end
     * @param {string} args.after Only return records that come after the specified value
     * @param {string} args.before Only return records that come before the specified value
     * @param {array} args.order The array of order instructions
     * @param {string} args.order.field The field the order instruction applies to
     * @param {boolean} args.order.desc Whether the field should be ordered descending
     * @param {array} args.filter The array of filter instructions
     * @param {string} args.filter.field The field the filter should be applied to
     * @param {string} args.filter.op The operation (One of: LT, LTE, EQ, GTE, GT, CONTAINS)
     * @param {string} args.filter.value The value the comparison should be made from (values will be coalesced)
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {object} context.log.stat.increment The stat function to increment a counter
     * @param {object} context.log.stat.gauge The stat function to monitor values over time
     */
    async function list(source, args, context) {
        context.log.stat.increment(`datasource.<%= name %>.list.begin`);
        if (args.first <= 0 || args.last <= 0) {
            context.log.stat.gauge(`datasource.<%= name %>.list.count`, 0);
            context.log.stat.increment(`datasource.<%= name %>.list.complete`);
            return emptyConnection();
        }

        let hasPreviousPage = false,
            hasNextPage = false,
            result = [];

        // TODO: Your implementation here

        const connection = {
            edges: result.map(createEdge),
            pageInfo: { hasPreviousPage, hasNextPage }
        };

        context.log.stat.gauge(`datasource.<%= name %>.list.count`, result.length);
        context.log.stat.increment(`datasource.<%= name %>.list.complete`);

        return connection;
    }

    function createEdge(node) {
        return {
            node,
            // TODO: Would be nice to do this only if the cursor is requested
            cursor: createCursor(node)
        };
    }

    function createCursor(node) {
        const data = key.reduce((result, fieldName) => {
            result[fieldName] = node[fieldName];
            return result;
        }, {});
        return Buffer.from(JSON.stringify(data), `utf8`).toString(`base64`);
    }

    function decodeCursor(cursor) {
        const data = JSON.parse(Buffer.from(cursor, `base64`).toString(`utf8`));
        return data;
    }

    function emptyConnection() {
        return {
            edges: [],
            pageInfo: { hasPreviousPage: false, hasNextPage: false }
        };
    }
};
