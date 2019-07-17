module.exports = createUpsertHandler;

const createCreateHandler = require(`./create.js`),
    { mold, elementMatches } = require(`./common.js`);

function createUpsertHandler(key, shape, data) {
    const create = createCreateHandler(key, shape, data);
    return upsert;

    /**
     * Creates a new record in the data source if it does not exist, otherwise replaces an existing one. This record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @param {object} info The resolution information that can be used to determine, for example, the fields being selected
     * @throws When args.input is not an object, or when shape is supplied and args.input does not match it
     */
    function upsert(source, args, context, info) {
        context.log.stat.increment(`datasource.memory.upsert`);

        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const index = data.findIndex(element => elementMatches(key, element, args.input));
        if (index === -1) {
            return create(source, args, context, info);
        } else {
            const record = mold(args.input, shape);
            data[index] = record;
            return data[index];
        }
    }

};