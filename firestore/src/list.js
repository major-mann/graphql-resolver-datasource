module.exports = createListHandler;

const LIMIT = 200;

const { FieldPath } = require(`@google-cloud/firestore`);

function createListHandler(collection, createKey) {
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
        const isTailQuery = args.last > args.first ||
            args.first >= 0 === false && args.last > 0;

        // Get the arguments we are interested in for easy access
        const { filter, order, before, after, first, last } = extractArgs(args, isTailQuery);

        if (first <= 0 || last <= 0) {
            context.log.stat.gauge(`datasource.firestore.list.count`, 0);
            context.log.stat.increment(`datasource.firestore.list.complete`);
            return emptyConnection();
        }

        const limit = calculateLimit();
        if (limit > LIMIT) {
            throw new Error(`The maximum number of records that can be requested (using first and last) ` +
                `is ${LIMIT}. Received ${limit} (first: ${first}. last: ${last})`);
        }

        let query = collection;
        if (filter) {
            filter.forEach(filterEntry => query = processFilter(query, filterEntry));
        }

        const finalOrderInstructions = orderInstructions(order, before, after, isTailQuery);
        finalOrderInstructions.forEach(ord => query = query.orderBy(...ord));

        let hasPreviousPage = false;
        let hasNextPage = false;
        if (after) {
            hasPreviousPage = true;
            const cursorData = deserializeCursor(after);
            query = query.startAfter(...cursorData);
        }
        if (before) {
            hasNextPage = true;
            const cursorData = deserializeCursor(before);
            query = query.endBefore(...cursorData);
        }
        query = query.limit(limit + 1);

        // Get some data
        const results = await exec(query);

        if (results.length > limit) {
            hasNextPage = true;
            results.pop();
        }

        // Note: If we have both last and first at this point last will always be less
        //  that first. This condition lets us exclude cases where both are not supplied
        if (last < first) {
            // Trim the start
            trimStart(results, last);
            hasPreviousPage = true;
        }

        if (isTailQuery) {
            const tmp = hasNextPage;
            hasNextPage = hasPreviousPage;
            hasPreviousPage = tmp;
            results.reverse();
        }

        const connection = {
            edges: results.map(node => createEdge(finalOrderInstructions, node)),
            pageInfo: { hasPreviousPage, hasNextPage }
        };

        context.log.stat.gauge(`datasource.firestore.list.count`, results.length);
        return connection;

        function calculateLimit() {
            if (first >=0 && last >= 0) {
                return Math.max(first, last);
            } else if (first >= 0) {
                return first;
            } else if (last >= 0) {
                return last;
            } else {
                return LIMIT;
            }
        }
    }

    function createEdge(order, node) {
        const cursorValue = order.length === 0 ?
            [createKey(node)] :
            order.map(instruction => fieldValue(instruction[0]));

        return {
            node,
            // TODO: Would be nice to do this only if the cursor is requested
            cursor: serializeCursor(cursorValue)
        };

        function fieldValue(field) {
            if (field === FieldPath.documentId()) {
                return createKey(node);
            } else {
                return node[field];
            }
        }
    }

    function serializeCursor(cursor) {
        const jsonSource = JSON.stringify(cursor);
        return Buffer.from(jsonSource, `utf8`).toString(`base64`);
    }

    function deserializeCursor(base64Source) {
        const jsonSource = Buffer.from(base64Source, `base64`)
            .toString(`utf8`);
        const parsed = JSON.parse(jsonSource);
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            return [parsed];
        }
    }

    function emptyConnection() {
        return {
            edges: [],
            pageInfo: { hasPreviousPage: false, hasNextPage: false }
        };
    }

    async function exec(query) {
        const snapshot = await query.get();
        const records = [];
        snapshot.forEach(record => records.push(record.data()));
        return records;
    }

    function processFilter(query, filter) {
        return query.where(filter.field, operator(filter.op), filter.value);
    }

    function orderInstructions(supplied, before, after, isTailQuery) {
        supplied = supplied || [];
        const instructions = [];
        if (supplied.length === 0) {
            if (before || after || isTailQuery) { // Add a default order so we can call pagination methods
                instructions.push(createInstruction(FieldPath.documentId(), isTailQuery));
            }
        } else {
            instructions.push(...supplied.map(item => createInstruction(item.field, item.desc)));
        }
        return instructions;

        function createInstruction(field, desc) {
            if (desc) {
                return [field, `desc`];
            } else {
                return [field];
            }
        }
    }

    function operator(op) {
        switch (op) {
            case `LT`:
                return `<`;
            case `LTE`:
                return `<=`;
            case `EQ`:
                return `==`;
            case `GTE`:
                return `>=`;
            case `GT`:
                return `>`;
            case `CONTAINS`:
                return `CONTAINS`;
            default:
                throw new Error(`Unsupported operation "${op}"`);
        }
    }

    function trimStart(arr, length) {
        if (length < arr.length) {
            arr.splice(0, arr.length - length);
        }
        return arr;
    }

    function extractArgs(args, isTailQuery) {
        if (!isTailQuery) {
            return args;
        }
        const { filter, order, before, after, first, last } = args;

        const reversedOrder = order && order.map(ord => ({
            ...ord,
            desc: !ord.desc
        }));

        return {
            filter,
            last: first,
            first: last,
            after: before,
            before: after,
            order: reversedOrder
        };
    }
}
