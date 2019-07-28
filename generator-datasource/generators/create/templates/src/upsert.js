module.exports = createUpsertHandler;

function createUpsertHandler() {
    return upsert;

    /**
     * Creates a new record in the data source if it does not exist, otherwise replaces an existing one. This
     *  record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object
     */
    async function upsert(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        // TODO: Implementation goes here

        // return record;
    }

}
