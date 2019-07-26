module.exports = createDeleteHandler;

const { elementMatches } = require(`./common.js`);

function createDeleteHandler(key, shape, data) {
    return remove;

    /**
     * Removes a record from the data store
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object
     */
    function remove(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        const index = data.findIndex(element => elementMatches(key, element, args.input));
        let removed;
        if (index > -1) {
            removed = data.splice(index, 1)[0];
        }

        if (removed) {
            context.log.stat.increment(`datasource.memory.delete.found`);
        } else {
            context.log.stat.increment(`datasource.memory.delete.missing`);
        }
        return removed;
    }

}