module.exports = createUpdateHandler;

const { select, elementMatches } = require(`./common.js`);

function createUpdateHandler(key, shape, data) {
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
     * @throws When args.input is not an object, when the document to update cannot be found or when shape is supplied and
     *         args.input combined with the existing data does not match it
     */
    function update(source, args) {
        if (!args.input) {
            throw new Error(`No input value supplied in args`);
        }

        const index = data.findIndex(element => elementMatches(key, element, args.input));
        if (index === -1) {
            throw new Error(`Unable to find the document to update with the given input value`);
        }
        const record = select({ ...data[index], ...args.input }, shape);
        data[index] = record;
        return data[index];
    }

}
