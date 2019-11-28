module.exports = createPageTokenLister;

const LIMIT = 200;

const ConsumerError = require(`../consumer-error.js`);

function createPageTokenLister({ sourceName, lookup, listHandler, convertOut }) {
    return async function list(source, args, context) {
        const { first, last, after, before, filter, order } = (args.input || {});
        if (first <= 0 || last <= 0) {
            context.stat.gauge(`datasource.${sourceName}.list.count`, 0);
            context.stat.increment(`datasource.${sourceName}.list.complete`);
            return emptyConnection();
        }

        if (before || first > 0 === false && last > 0 || last > first) {
            throw new ConsumerError(`${sourceName} list does not support accessing data from the tail`);
        }
        if (order && order.length) {
            throw new ConsumerError(`${sourceName} list does not support ordering`);
        }

        const limit = calculateLimit();
        if (limit > LIMIT) {
            throw new ConsumerError(`The maximum number of records that can be requested (using first and last) ` +
                `is ${LIMIT}. Received ${limit} (first: ${first}. last: ${last})`);
        }

        const afterValue = after && deserializeCursor(after);
        if (afterValue && afterValue.field || filter && filter.length) {
            return pseudoList(afterValue);
        } else {
            return standardList(afterValue);
        }

        async function standardList(cursor) {
            let lim = limit;
            let hasNextPage = false;
            if (cursor && cursor.offset > 0) {
                lim = lim + cursor.offset;
            }
            const listResult = await listHandler(lim, cursor && cursor.list);
            let elements = [];
            listResult.data.forEach(user => elements.push(user));
            hasNextPage = elements.length >= lim && !!listResult.pageToken;

            // Remove any from the offset
            if (cursor && cursor.offset > 0) {
                for (let elementIndex = 0; elementIndex < cursor.offset; elementIndex++) {
                    elements.shift();
                }
            }

            if (last > 0) {
                elements = elements.slice(Math.max(elements.length - last, 0));
            }

            return buildResult(elements);

            function buildResult(users) {
                if (users) {
                    return {
                        edges: users
                            .map(buildEdge)
                            .filter(e => e),
                        pageInfo: {
                            hasNextPage,
                            hasPreviousPage: Boolean(cursor) || last > 0
                        }
                    };
                } else {
                    return emptyConnection();
                }

                function buildEdge(user, index) {
                    if (user) {
                        const edgeCursor = index === users.length - 1 && listResult.pageToken ?
                            serializeCursor({ list: listResult.pageToken, offset: 0 }) :
                            serializeCursor({ list: cursor && cursor.list, offset: index + 1 });
                        return {
                            node: convertOut(user),
                            cursor: edgeCursor
                        };
                    } else {
                        return undefined;
                    }
                }
            }
        }

        async function pseudoList(cursor) {
            filter.forEach(validateFieldOperation);
            let current, users;

            if (cursor) {
                users = [await lookup(cursor.field, cursor.value)]
                    .filter(user => user);
            } else {
                current = filter.shift();
                users = [await lookup(current.field, current.value)]
                    .filter(user => user);
            }

            // If we have additional, make sure all filters match the user
            while (filter.length && users.length) {
                current = filter.shift();
                users = users.filter(user => user[current.field] === current.value);
            }
            return buildResult(users);

            function buildResult(users) {
                if (users) {
                    return {
                        edges: users.map(buildEdge),
                        pageInfo: {
                            hasPreviousPage: false,
                            hasNextPage: false
                        }
                    };
                } else {
                    return emptyConnection();
                }

                function buildEdge(user) {
                    // TODO: Can we avoid building the cursor based on requested fields?
                    return {
                        node: convertOut(user),
                        cursor: serializeCursor({ field: `uid`, value: user.uid })
                    };
                }
            }

            function validateFieldOperation(filter) {
                if (filter.op !== `EQ`) {
                    throw new ConsumerError(`Filter operations on users only support comparison (equals) operations`);
                }
            }
        }

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
    };

    function emptyConnection() {
        return {
            edges: [],
            pageInfo: { hasPreviousPage: false, hasNextPage: false }
        };
    }

    function serializeCursor({ field, value, list, offset }) {
        const data = { f: field, v: value, l: list, o: offset };
        return Buffer.from(JSON.stringify(data)).toString(`base64`);
    }

    function deserializeCursor(cursor) {
        const buffer = Buffer.from(cursor, `base64`);
        const data = JSON.parse(buffer.toString(`utf8`));
        return {
            field: data.f,
            value: data.v,
            list: data.l,
            offset: data.o
        };
    }
}
