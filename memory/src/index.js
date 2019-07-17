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

    return {
        find: createFindHandler(key, shape, data),
        list: createListHandler(key, shape, data),
        create: createCreateHandler(key, shape, data),
        upsert: createUpsertHandler(key, shape, data),
        update: createUpdateHandler(key, shape, data),
        delete: createDeleteHandler(key, shape, data)
    };
}
