module.exports = createFirebaseAuthDatasource;

const STATS_IGNORE = [`dispose`];

const uuid = require(`uuid`);
const firebase = require(`firebase-admin`);

const loadWebConfig = require(`./util/load-web-config.js`),
    createRefreshIdTokenHandler = require(`./token/refresh-id-token.js`),
    createAuthenticateHandler = require(`./token/authenticate.js`),
    createCreateTokenHandler = require(`./token/create-token.js`),
    createVerifyTokenHandler = require(`./token/verify-token.js`),
    createRevokeTokenHandler = require(`./token/revoke-token.js`),
    createCreateHandler = require(`./user/create.js`),
    createUpsertHandler = require(`./user/upsert.js`),
    createUpdateHandler = require(`./user/update.js`),
    createDeleteHandler = require(`./user/delete.js`),
    createFindHandler = require(`./user/find.js`),
    createListHandler = require(`./user/list.js`),
    createRestClient = require(`./rest/index.js`),
    createOutOfBandHandlers = require(`./oob-actions.js`);

async function createFirebaseAuthDatasource(serviceAccount, firebaseConfig) {
    const appOptions = {};
    appOptions.credential = firebase.credential.cert(serviceAccount);
    if (firebaseConfig) {
        Object.assign(appOptions, firebaseConfig);
    }
    const app = firebase.initializeApp(appOptions, `datasource:${uuid.v4().substr(-12)}`);
    const tenantManager = app.auth().tenantManager();

    const { apiKey } = await loadWebConfig(serviceAccount);
    const loadAuth = tenantId => tenantManager.authForTenant(tenantId);

    const rest = createRestClient(apiKey);
    const authenticate = createAuthenticateHandler(rest);
    const revokeToken = createRevokeTokenHandler(loadAuth, rest);
    const verifyToken = createVerifyTokenHandler(loadAuth, rest);
    const refreshIdToken = createRefreshIdTokenHandler(rest);
    const createToken = createCreateTokenHandler(serviceAccount, rest);
    const find = createFindHandler(loadAuth);
    const upsert = createUpsertHandler(loadAuth, find);
    const create = createCreateHandler(loadAuth, find, upsert);
    const update = createUpdateHandler(loadAuth, find, upsert);

    const {
        generateSignIn,
        generatePasswordReset,
        generateEmailVerification,
        sendPasswordReset,
        verifyPasswordReset,
        confirmPasswordReset,
        sendEmailVerification,
        confirmEmailVerification
    } = createOutOfBandHandlers(loadAuth, rest);

    const resolvers = {
        find,
        create,
        update,
        upsert,
        dispose,
        createToken,
        revokeToken,
        verifyToken,
        authenticate,
        refreshIdToken,
        generateSignIn,
        sendPasswordReset,
        verifyPasswordReset,
        confirmPasswordReset,
        generatePasswordReset,
        sendEmailVerification,
        confirmEmailVerification,
        generateEmailVerification,
        list: createListHandler(loadAuth),
        delete: createDeleteHandler(loadAuth, find)
    };

    return Object.keys(resolvers).reduce((result, name) => {
        if (STATS_IGNORE.includes(name)) {
            result[name] = resolvers[name];
        } else {
            result[name] = statsWrap(name, resolvers[name]);
        }
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

    function dispose() {
        app.delete();
    }
}
