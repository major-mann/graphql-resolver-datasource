module.exports = createFirebaseAuthDatasource;

const createRefreshIdTokenHandler = require(`./token/refresh-id-token.js`),
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
    createRestClient = require(`./rest/index.js`);

function createFirebaseAuthDatasource(auth, apiKey) {
    const rest = createRestClient(apiKey);
    const authenticate = createAuthenticateHandler(rest);
    const revokeToken = createRevokeTokenHandler(auth, rest);
    const verifyToken = createVerifyTokenHandler(auth, rest);
    const refreshIdToken = createRefreshIdTokenHandler(rest);
    const createToken = createCreateTokenHandler(auth, rest);
    const find = createFindHandler(auth);
    const upsert = createUpsertHandler(auth, find);
    const create = createCreateHandler(auth, find, upsert);
    const update = createUpdateHandler(auth, find, upsert);

    const resolvers = {
        find,
        create,
        update,
        upsert,
        createToken,
        revokeToken,
        verifyToken,
        authenticate,
        refreshIdToken,
        list: createListHandler(auth),
        delete: createDeleteHandler(auth, find),
        generateSignIn: (source, args) => auth.generateSignInWithEmailLink(
            args.input.email
        ),
        generatePasswordReset: (source, args) => auth.generatePasswordResetLink(
            args.input.email
        ),
        sendPasswordReset: (source, args) => rest.sendPasswordReset(
            args.input.email,
            args.input.locale
        ),
        verifyPasswordReset: (source, args) => rest.verifyPasswordResetCode(
            args.input.code
        ),
        confirmPasswordReset: (source, args) => rest.confirmPasswordReset(
            args.input.code,
            args.input.password
        ),
        generateEmailVerification: (source, args) => auth.generateEmailVerificationLink(
            args.input.email
        ),
        sendEmailVerification: (source, args) => rest.sendEmailVerification(
            args.input.token,
            args.input.locale
        ),
        confirmEmailVerification: (source, args) => rest.confirmEmailVerification(
            args.input.code
        )
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
