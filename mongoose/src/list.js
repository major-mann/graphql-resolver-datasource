module.exports = createListHandler;

const LIMIT = 200;

const { cleanResult } = require(`./common.js`);

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
     * @param {object} context.stat The stats object
     * @param {object} context.stat.increment The stat function to increment a counter
     * @param {object} context.stat.gauge The stat function to monitor values over time
     */
    async function list(source, args, context) {
        let hasPreviousPage = false;
        let hasNextPage = false;
        const isTailQuery = args.input.last > args.input.first ||
            args.input.first >= 0 === false && args.input.last > 0;

        // Get the arguments we are interested in for easy access
        const { filter, order, before, after, first, last } = extractArgs(args, isTailQuery);

        if (first <= 0 || last <= 0) {
            context.stat.gauge(`datasource.mongoose.list.count`, 0);
            return emptyConnection();
        }

        const limit = calculateLimit();
        if (limit > LIMIT) {
            throw new Error(`The maximum number of records that can be requested (using first and last) ` +
                `is ${LIMIT}. Received ${limit} (first: ${first}. last: ${last})`);
        }

        const mongoFilter = {};
        if (filter) {
            filter.forEach(entry => addFilter(mongoFilter, entry));
        }

        const mongoOrder = orderInstructions(order, before, after, isTailQuery);

        if (before) {
            hasNextPage = true;
            addCursorFilter(mongoFilter, mongoOrder, before, false);
        }

        if (after) {
            hasPreviousPage = true;
            addCursorFilter(mongoFilter, mongoOrder, after, true);
        }

        let results = await collection
            .find(mongoFilter)
            .sort(mongoOrder)
            .limit(limit + 1)
            .exec();
        results = results.map(cleanResult);

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
            edges: results.map(node => createEdge(mongoOrder, node)),
            pageInfo: { hasPreviousPage, hasNextPage }
        };

        context.stat.gauge(`datasource.mongoose.list.count`, results.length);
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
        const orderKeys = Object.keys(order);
        const cursorValue = orderKeys.length === 0 ?
            [createKey(node)] :
            orderKeys.map(field => node[field]);

        return {
            node,
            // TODO: Would be nice to do this only if the cursor is requested
            cursor: serializeCursor(cursorValue)
        };
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

    function cursorValue(cursor, index) {
        if (cursor[index] === undefined) {
            throw new Error(`supplied cursor is for a different query`);
        }
        return cursor[index];
    }

    function addCursorFilter(mongoFilter, mongoOrder, cursor, after) {
        const cursorData = deserializeCursor(cursor);
        Object.keys(mongoOrder).forEach(
            (field, index) => addFilter(
                mongoFilter,
                {
                    field,
                    op: operation(mongoOrder[field]),
                    value: cursorValue(cursorData, index)
                }
            )
        );

        function operation(direction) {
            if (after) {
                direction = direction * -1;
            }
            return direction === 1 ?
                `LT` :
                `GT`;
        }
    }

    function addFilter(mongoFilter, filter) {
        if (mongoFilter.$and) {
            mongoFilter.$and.push({ [filter.field]: processFilter(filter) });
        } else if (mongoFilter[filter.field]) {
            mongoFilter.$and = Object.keys(mongoFilter).map(
                field => ({ [field]: mongoFilter[field] })
            );
            Object.keys(mongoFilter).forEach(key => {
                if (key !== `$and`) {
                    delete mongoFilter[key];
                }
            });
            addFilter(mongoFilter, filter);
        } else {
            mongoFilter[filter.field] = processFilter(filter);
        }
    }

    function processFilter(filter) {
        switch (filter.op) {
            case `LT`:
                return { $lt: filter.value };
            case `LTE`:
                return { $lte: filter.value };
            case `GTE`:
                return { $gte: filter.value };
            case `GT`:
                return { $gt: filter.value };
            case `EQ`:
            case `CONTAINS`:
                return filter.value;
            default:
                throw new Error(`Unsupported operation "${filter.op}"`);
        }
    }

    function orderInstructions(supplied, before, after, isTailQuery) {
        supplied = supplied || [];
        const instructions = {};
        if (supplied.length === 0) {
            if (before || after || isTailQuery) { // Add a default order so we can call pagination methods
                instructions._id = isTailQuery ? -1 : 1;
            }
        } else {
            supplied.forEach(
                instruction => instructions[instruction.field] = instruction.desc ? -1 : 1
            );
        }
        return instructions;
    }

    function trimStart(arr, length) {
        if (length < arr.length) {
            arr.splice(0, arr.length - length);
        }
        return arr;
    }

    function extractArgs(args, isTailQuery) {
        if (!isTailQuery) {
            return args.input;
        }
        const { filter, order, before, after, first, last } = args.input;

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
