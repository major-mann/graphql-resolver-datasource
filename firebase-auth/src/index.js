module.exports = createFirebaseAuthDatasource;

const createRefreshIdTokenHandler = require(`./refresh-id-token.js`),
    createLastLogoutTokenHandler = require(`./last-logout.js`),
    createAuthenticateHandler = require(`./authenticate.js`),
    createVerifyTokenHandler = require(`./verify-token.js`),
    createRevokeTokenHandler = require(`./revoke-token.js`),
    createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`),
    createRestClient = require(`./rest.js`);

function createFirebaseAuthDatasource(auth, apiKey) {
    const rest = createRestClient(apiKey);
    const authenticate = createAuthenticateHandler(rest);
    const revokeToken = createRevokeTokenHandler(auth, rest);
    const verifyToken = createVerifyTokenHandler(auth, rest);
    const refreshIdToken = createRefreshIdTokenHandler(rest);
    const lastLogout = createLastLogoutTokenHandler(auth);
    const find = createFindHandler(auth);
    const create = createCreateHandler(auth);
    const update = createUpdateHandler(auth);
    const resolvers = {
        find,
        create,
        update,
        lastLogout,
        revokeToken,
        verifyToken,
        authenticate,
        refreshIdToken,
        list: createListHandler(auth),
        delete: createDeleteHandler(auth, find),
        upsert: createUpsertHandler(find, create, update)
    };

    return Object.keys(resolvers).reduce((result, name) => {
        result[name] = statsWrap(name, resolvers[name]);
        return result;
    }, {});

    function statsWrap(name, resolver) {
        const beginStatName = `datasource.firebase-auth.${name}.begin`;
        const completeStatName = `datasource.firebase-auth.${name}.complete`;
        const failStatName = `datasource.firebase-auth.${name}.fail`;
        const timingStatName = `datasource.firebase-auth.${name}.time`;
        return async function timeExecution(source, args, context, info) {
            const executionStart = Date.now();
            context.stat.increment(beginStatName);
            try {
                const result = await resolver(source, args, context, info);
                context.stat.increment(completeStatName);
                context.stat.timing(timingStatName, executionStart);
                return result;
            } catch (ex) {
                context.stat.increment(failStatName);
                throw ex;
            }
        };
    }
}
