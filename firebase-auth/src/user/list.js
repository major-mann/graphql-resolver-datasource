module.exports = createListHandler;

const createPageTokenList = require(`@major-mann/graphql-resolver-datasource-util-page-token-list`);
const ConsumerError = require(`../consumer-error.js`),
    { plainUserObject } = require(`./common.js`);

function createListHandler(loadAuth) {
    return createPageTokenList({
        sourceName: `firebase-auth`,
        lookup,
        listHandler,
        convertOut: plainUserObject
    });

    async function lookup(field, value, { args }) {
        let user;
        const auth = await loadAuth(args.input.tenantId);
        switch (field) {
            case `uid`:
                user = await findByUid(value);
                break;
            case `email`:
                user = await findByEmail(value);
                break;
            case `phoneNumber`:
                user = await findByPhoneNumber(value);
                break;
            default:
                throw new ConsumerError(`Filtering on "${field}" not supported`);
        }
        return user;

        function findByUid(uid) {
            return findBy(() => auth.getUser(uid));
        }

        function findByEmail(email) {
            return findBy(() => auth.getUserByEmail(email));
        }

        function findByPhoneNumber(phoneNumber) {
            return findBy(() => auth.getUserByPhoneNumber(phoneNumber));
        }
    }

    async function findBy(handler) {
        try {
            const result = await handler();
            return result;
        } catch (ex) {
            if (ex.code === `auth/user-not-found`) {
                return undefined;
            } else {
                throw ex;
            }
        }
    }

    async function listHandler(limit, cursor, { args }) {
        const auth = await loadAuth(args.input.tenantId);
        const listResult = await auth.listUsers(limit, cursor && cursor.list);
        return {
            data: listResult.users,
            pageToken: listResult.pageToken
        };
    }
}
