module.exports = createUpsertHandler;

const { select } = require(`./common.js`);

function createUpsertHandler(key, shape) {
    return upsert;

    /**
     * Creates a new record in the data source if it does not exist, otherwise replaces an existing one. This
     *  record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object, or when shape is supplied and args.input does not match it
     */
    async function upsert(source, args, context) {
        context.log.stat.increment(`datasource.<%= name =>.upsert.begin`);

        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        let record = select(args.input, shape);
        // TODO: Implementation goes here

        context.log.stat.increment(`datasource.<%= name =>.upsert.complete`);
        return record;
    }

}
