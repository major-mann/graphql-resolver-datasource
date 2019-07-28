module.exports = create<%= capitalizedName %>Datasource;

const createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`);

function create<%= capitalizedName %>Datasource() {
    const resolvers = {
        find: createFindHandler(),
        list: createListHandler(),
        create: createCreateHandler(),
        upsert: createUpsertHandler(),
        update: createUpdateHandler(),
        delete: createDeleteHandler()
    };

    return Object.keys(resolvers).reduce((result, name) => {
        result[name] = statsWrap(name, resolvers[name]);
        return result;
    }, {});

    function statsWrap(name, resolver) {
        const beginStatName = `datasource.<%= name %>.${name}.begin`;
        const completeStatName = `datasource.<%= name %>.${name}.complete`;
        const failStatName = `datasource.<%= name %>.${name}.fail`;
        const timingStatName = `datasource.<%= name %>.${name}.time`;
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
