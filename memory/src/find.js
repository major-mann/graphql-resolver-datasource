module.exports = createFindHandler;

const { elementMatches } = require(`./common.js`);

function createFindHandler(key, shape, data) {
    return find;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to search for the entity with.
     * @param {object} args.input The search object
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment creation stats
     * @throws When args.input is not an object
     */
    function find(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        if (key.some(k => args.input[k] === undefined)) {
            throw new Error(`All key fields must be supplied to find (${key.join(`, `)})`);
        }
        const record = data.find(element => elementMatches(key, element, args.input));
        if (record) {
            context.log.stat.increment(`datasource.memory.find.found`);
        } else {
            context.log.stat.increment(`datasource.memory.find.missing`);
        }
        return record;
    }
}
