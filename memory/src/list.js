module.exports = createListHandler;

const { elementMatches } = require(`./common.js`);

function createListHandler(key, shape, data) {
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
    function list(source, args, context) {
        if (args.first <= 0 || args.last <= 0) {
            context.log.stat.gauge(`datasource.memory.list.count`, 0);
            return emptyConnection();
        }

        let result = data.slice().filter(filter);
        order(result, args.order);

        let hasPreviousPage = false,
            hasNextPage = false;

        if (args.after) {
            const cursor = decodeCursor(args.after);
            while (result.length && !elementMatches(key, result[0], cursor)) {
                hasPreviousPage = true;
                result.shift();
            }
            result.shift(); // Remove the matching one
        }

        if (args.before) {
            const cursor = decodeCursor(args.before);
            while (result.length && !elementMatches(key, result[result.length - 1], cursor)) {
                hasNextPage = true;
                result.pop();
            }
            result.pop(); // Remove the matching one
        }

        let first = args.first > 0 ?
            args.first :
            undefined;
        let last = args.last > 0 ?
            args.last :
            undefined;

        if (first < last) {
            hasNextPage = true;
            hasPreviousPage = hasPreviousPage || last < data.length;
            const spliceSize = Math.min(first, result.length - last);
            result.splice(0, spliceSize);
            result = result.slice(0, first);
        } else if (first > last) {
            hasPreviousPage = true;
            hasNextPage = hasNextPage || first < data.length;
            const spliceSize = Math.min(last, result.length - first);
            result.splice(result.length - spliceSize);
            result = result.slice(result.length - last);
        } else if (first > 0) {
            hasPreviousPage = hasPreviousPage || false;
            hasNextPage = hasNextPage || first < data.length;
            result.splice(first);
        } else if (last > 0) {
            hasNextPage = hasNextPage || false;
            hasPreviousPage = hasPreviousPage || last < data.length;
            result = result.slice(result.length - last);
        }

        const connection = {
            edges: result.map(createEdge),
            pageInfo: { hasPreviousPage, hasNextPage }
        };

        context.log.stat.gauge(`datasource.memory.list.count`, result.length);
        return connection;

        function filter(element) {
            if (!Array.isArray(args.filter) || !args.filter.length) {
                return true;
            }
            return args.filter.every(function checkFilterInstruction(instruction) {
                switch (instruction.op) {
                    case `LT`:
                        return element[instruction.field] < instruction.value;
                    case `LTE`:
                        return element[instruction.field] <= instruction.value;
                    case `EQ`:
                        return element[instruction.field] == instruction.value; // Note: == on purpose
                    case `GTE`:
                        return element[instruction.field] >= instruction.value;
                    case `GT`:
                        return element[instruction.field] > instruction.value;
                    case `CONTAINS`:
                        return element[instruction.field] == instruction.value ||
                            element[instruction.field].includes(instruction.value);
                    default:
                        throw new Error(`Unknown op "${instruction.op}" received`);
                }
            });
        }

        function order(array, instructions) {
            if (Array.isArray(instructions) && instructions.length) {
                array.sort(compare);
            }

            function compare(a, b) {
                for (let index = 0; index < instructions.length; index++) {
                    const fieldName = instructions[index].field;
                    const valueA = a[fieldName];
                    const valueB = b[fieldName];

                    if (valueA < valueB) {
                        return -1 * desc(instructions[index]);
                    } else if (valueA > valueB) {
                        return 1 * desc(instructions[index]);
                    }

                }
                return 0;
            }

            function desc(instruction) {
                return instruction.desc ?
                    -1 :
                    1;
            }
        }
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
}

