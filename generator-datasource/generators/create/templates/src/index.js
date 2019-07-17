module.exports = create<%= capitalizedName %>Datasource;

const createCreateHandler = require(`./create.js`),
    createUpsertHandler = require(`./upsert.js`),
    createUpdateHandler = require(`./update.js`),
    createDeleteHandler = require(`./delete.js`),
    createFindHandler = require(`./find.js`),
    createListHandler = require(`./list.js`);

function create<%= capitalizedName %>Datasource(key, shape) {
    if (!Array.isArray(key)) {
        key = [key];
    }

    if (typeof shape !== `object`) {
        shape = undefined;
    }

    return {
        find: createFindHandler(key, shape),
        list: createListHandler(key, shape),
        create: createCreateHandler(key, shape),
        upsert: createUpsertHandler(key, shape),
        update: createUpdateHandler(key, shape),
        delete: createDeleteHandler(key, shape)
    };
}
