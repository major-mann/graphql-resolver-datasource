module.exports = createFirestoreDatasource;

const createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`);

function createFirestoreDatasource(collection, createKey, autoGenerate) {
    // TODO: Check args
    const resolvers = {
        find: createFindHandler(collection, createKey),
        list: createListHandler(collection, createKey),
        create: createCreateHandler(collection, createKey, autoGenerate),
        upsert: createUpsertHandler(collection, createKey),
        update: createUpdateHandler(collection, createKey),
        delete: createDeleteHandler(collection, createKey)
    };

    return Object.keys(resolvers).reduce((result, name) => {
        result[name] = statsWrap(name, resolvers[name]);
        return result;
    }, {});

    function statsWrap(name, resolver) {
        const beginStatName = `datasource.firestore.${name}.begin`;
        const completeStatName = `datasource.firestore.${name}.complete`;
        const failStatName = `datasource.firestore.${name}.fail`;
        const timingStatName = `datasource.firestore.${name}.time`;
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
