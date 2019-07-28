module.exports = createMemoryDatasource;

const createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`);

function createMemoryDatasource(key, shape, data) {
    if (!Array.isArray(key)) {
        key = [key];
    }
    if (!Array.isArray(data)) {
        data = [];
    }

    if (typeof shape !== `object`) {
        shape = undefined;
    }

    const resolvers = {
        find: createFindHandler(key, shape, data),
        list: createListHandler(key, shape, data),
        create: createCreateHandler(key, shape, data),
        upsert: createUpsertHandler(key, shape, data),
        update: createUpdateHandler(key, shape, data),
        delete: createDeleteHandler(key, shape, data)
    };
    return Object.keys(resolvers).reduce((result, name) => {
        result[name] = statsWrap(name, resolvers[name]);
        return result;
    }, {});

    function statsWrap(name, resolver) {
        const beginStatName = `datasource.memory.${name}.begin`;
        const completeStatName = `datasource.memory.${name}.complete`;
        const failStatName = `datasource.memory.${name}.fail`;
        const timingStatName = `datasource.memory.${name}.time`;
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
