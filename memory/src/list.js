module.exports = createListHandler;

const { elementMatches } = require(`./common.js`);

function createListHandler(key, shape, data) {
    return list;

    /**
     * Lists the records applying and supplied order and filter instructions, and optionally paging
     * @param {*} source Unused
     * @param {object} args The arguments to use to determine what to list
     * @param {number} args.input.first Limit the returned number of records from the start
     * @param {number} args.input.last Limit the returned number of records from the end
     * @param {string} args.input.after Only return records that come after the specified value
     * @param {string} args.input.before Only return records that come before the specified value
     * @param {array} args.input.order The array of order instructions
     * @param {string} args.input.order.field The field the order instruction applies to
     * @param {boolean} args.input.order.desc Whether the field should be ordered descending
     * @param {array} args.input.filter The array of filter instructions
     * @param {string} args.input.filter.field The field the filter should be applied to
     * @param {string} args.input.filter.op The operation (One of: LT, LTE, EQ, GTE, GT, CONTAINS)
     * @param {string} args.input.filter.value The value the comparison should be made from (values will be coalesced)
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {object} context.stat.increment The stat function to increment a counter
     * @param {object} context.stat.gauge The stat function to monitor values over time
     */
    function list(source, args, context) {
        const { first, last, after, before, filter, order } = args.input;
        if (first <= 0 || last <= 0) {
            context.stat.gauge(`datasource.memory.list.count`, 0);
            return emptyConnection();
        }

        let result = data.slice().filter(filterElement);
        orderArray(result, order);

        let hasPreviousPage = false,
            hasNextPage = false;

        if (after) {
            const cursor = decodeCursor(after);
            while (result.length && !elementMatches(key, result[0], cursor)) {
                hasPreviousPage = true;
                result.shift();
            }
            result.shift(); // Remove the matching one
        }

        if (before) {
            const cursor = decodeCursor(before);
            while (result.length && !elementMatches(key, result[result.length - 1], cursor)) {
                hasNextPage = true;
                result.pop();
            }
            result.pop(); // Remove the matching one
        }

        const saneFirst = first > 0 ?
            first :
            undefined;
        const saneLast = last > 0 ?
            last :
            undefined;

        if (saneFirst < saneLast) {
            hasNextPage = true;
            hasPreviousPage = hasPreviousPage || saneLast < data.length;
            const spliceSize = Math.min(saneFirst, result.length - saneLast);
            result.splice(0, spliceSize);
            result = result.slice(0, saneFirst);
        } else if (saneFirst > saneLast) {
            hasPreviousPage = true;
            hasNextPage = hasNextPage || saneFirst < data.length;
            const spliceSize = Math.min(saneLast, result.length - saneFirst);
            result.splice(result.length - spliceSize);
            result = result.slice(result.length - saneLast);
        } else if (saneFirst > 0) {
            hasPreviousPage = hasPreviousPage || false;
            hasNextPage = hasNextPage || saneFirst < data.length;
            result.splice(saneFirst);
        } else if (saneLast > 0) {
            hasNextPage = hasNextPage || false;
            hasPreviousPage = hasPreviousPage || saneLast < data.length;
            result = result.slice(result.length - saneLast);
        }

        const connection = {
            edges: result.map(createEdge),
            pageInfo: { hasPreviousPage, hasNextPage }
        };

        context.stat.gauge(`datasource.memory.list.count`, result.length);
        return connection;

        function filterElement(element) {
            if (!Array.isArray(filter) || !filter.length) {
                return true;
            }
            return filter.every(function checkFilterInstruction(instruction) {
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

        function orderArray(array, instructions) {
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

