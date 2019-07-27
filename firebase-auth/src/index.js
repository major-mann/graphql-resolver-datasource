module.exports = createFirebaseAuthDatasource;

const createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`);

function createFirebaseAuthDatasource(auth) {
    const find = createFindHandler(auth);
    const create = createCreateHandler(auth);
    const update = createUpdateHandler(auth);
    const resolvers = {
        find,
        create,
        update,
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
            context.log.stat.increment(beginStatName);
            try {
                const result = await resolver(source, args, context, info);
                context.log.stat.increment(completeStatName);
                context.log.stat.timing(timingStatName, executionStart);
                return result;
            } catch (ex) {
                context.log.stat.increment(failStatName);
                throw ex;
            }
        };
    }
}
