module.exports = createListHandler;

const LIMIT = 200;

function createListHandler(auth, find) {
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
        if (args.first <= 0 || args.last <= 0) {
            context.log.stat.gauge(`datasource.firebase-auth.list.count`, 0);
            context.log.stat.increment(`datasource.firebase-auth.list.complete`);
            return emptyConnection();
        }

        if (args.before || args.first > 0 === false && args.last > 0 || args.last > args.first) {
            throw new Error(`firebase auth list does not support accessing data from the tail`);
        }
        if (args.order && args.order.length) {
            throw new Error(`Auth service user listing does not support ordering`);
        }

        const limit = calculateLimit();
        if (limit > LIMIT) {
            throw new Error(`The maximum number of records that can be requested (using first and last) ` +
                `is ${LIMIT}. Received ${limit} (first: ${args.first}. last: ${args.last})`);
        }

        if (args.after) {
            args.after = deserializeCursor(args.after);
        }
        if (args.after && args.after.field || args.filter && args.filter.length) {
            return pseudoList(args.after);
        } else {
            return standardList(args.after);
        }

        async function standardList(cursor) {
            let lim = limit;
            let hasNextPage = false;
            if (cursor && cursor.offset > 0) {
                lim = lim + cursor.offset;
            }
            const listResult = await auth.listUsers(lim + 1, cursor && cursor.list);
            let users = [];
            listResult.users.forEach(user => users.push(user));

            if (users.length > lim) {
                hasNextPage = true;
                users.pop();
            }

            // Remove any from the offset
            if (cursor && cursor.offset > 0) {
                for (var userIndex = 0; userIndex < cursor.offset; userIndex++) {
                    users.shift();
                }
            }

            if (args.last > 0) {
                users = users.slice(Math.max(users.length - args.last, 0));
            }

            return buildResult(users);

            function buildResult(users) {
                if (users) {
                    return {
                        edges: users
                            .map(buildEdge)
                            .filter(e => e),
                        pageInfo: {
                            hasPreviousPage: Boolean(cursor) || args.last > 0,
                            hasNextPage: Boolean(listResult.pageToken) || hasNextPage
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
                            node: {
                                uid: user.uid,
                                email: user.email,
                                emailVerified: user.emailVerified,
                                phoneNumber: user.phoneNumber,
                                disabled: user.disabled
                            },
                            cursor: edgeCursor
                        };
                    } else {
                        return undefined;
                    }
                }
            }
        }

        async function pseudoList(cursor) {
            args.filter.forEach(validateFieldOperation);
            let current, users;

            if (cursor) {
                users = [await lookup(cursor.field, cursor.value)];
            } else {
                current = args.filter.shift();
                users = [await lookup(current.field, current.value)];
            }

            // If we have additional, make sure all filters match the user
            while (args.filter.length && users.length) {
                current = args.filter.shift();
                users = users.filter(user => user[current.field] === current.value);
            }
            return buildResult(users);

            async function lookup(field, value) {
                let user;
                switch (field) {
                    case `uid`:
                        user = await find(value);
                        break;
                    case `email`:
                        user = await findByEmail(value);
                        break;
                    case `phoneNumber`:
                        user = await findByPhoneNumber(value);
                        break;
                    default:
                        throw new Error(`Filtering on "${field}" not supported`);
                }
                return user;
            }

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
                        node: {
                            uid: user.uid,
                            email: user.email,
                            emailVerified: user.emailVerified,
                            phoneNumber: user.phoneNumber,
                            disabled: user.disabled
                        },
                        cursor: serializeCursor({ field: `uid`, value: user.uid })
                    };
                }
            }

            function validateFieldOperation(filter) {
                if (filter.op !== `EQ`) {
                    throw new Error(`Filter operations on users only support comparison (equals) operations`);
                }
            }
        }

        async function findByEmail(email) {
            try {
                const user = await auth.getUserByEmail(email);
                return user;
            } catch (ex) {
                if (ex.code === `auth/user-not-found`) {
                    return undefined;
                } else {
                    throw ex;
                }
            }
        }

        async function findByPhoneNumber(phoneNumber) {
            try {
                const user = await auth.getUserByPhoneNumber(phoneNumber);
                return user;
            } catch (ex) {
                if (ex.code === `auth/user-not-found`) {
                    return undefined;
                } else {
                    throw ex;
                }
            }
        }

        function calculateLimit() {
            if (args.first >=0 && args.last >= 0) {
                return Math.max(args.first, args.last);
            } else if (args.first >= 0) {
                return args.first;
            } else if (args.last >= 0) {
                return args.last;
            } else {
                return LIMIT;
            }
        }
    }

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
