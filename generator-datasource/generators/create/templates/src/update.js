module.exports = createUpdateHandler;

const { select } = require(`./common.js`);

function createUpdateHandler(key, shape) {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object, when the document to update cannot be found or when shape is supplied and
     *         args.input combined with the existing data does not match it
     */
    async function update(source, args, context) {
        context.log.stat.increment(`datasource.<%= name =>.update.begin`);

        if (!args.input) {
            throw new Error(`No input value supplied in args`);
        }

        let existing, record;
        // TODO: Search implementation goes here.
        record = select({ ...existing, ...args.input }, shape);
        // TODO: Replace implementation goes here.

        // It should throw an error if a document cannot be found
        // It should only change fields present in the input
        context.log.stat.increment(`datasource.<%= name =>.update.complete`);

        return record;
    }

}
