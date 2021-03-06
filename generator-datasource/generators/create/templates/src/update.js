module.exports = createUpdateHandler;

function createUpdateHandler() {
    return update;

    /**
     * Updates a record in the data store
     * @param {*} source Unused
     * @param {object} args The arguments to update the entity with
     * @param {object} args.input The document to update
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object, when the document to update cannot be found
     */
    async function update(source, args, context) {
        if (!args.input) {
            throw new Error(`No input value supplied in args`);
        }

        let existing, record;
        // TODO: Search implementation goes here.
        // TODO: Replace implementation goes here.

        // It should throw an error if a document cannot be found
        // It should only change fields present in the input
        return record;
    }

}
