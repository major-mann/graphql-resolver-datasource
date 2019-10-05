module.exports = createFindHandler;

const { cleanResult } = require(`./common.js`);

function createFindHandler(collection, createKey) {
    return find;

    /**
     * Searches for a record using the key fields from the given input
     * @param {*} source Unused
     * @param {object} args The arguments to search for the entity with.
     * @param {object} args.input The search object
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment creation stats
     * @throws When args.input is not an object
     */
    async function find(source, args, context) {
        const id = createKey(args.input);
        const document = await collection.findOne({ _id: id });
        const result = cleanResult(document);
        if (result) {
            context.stat.increment(`datasource.mongoose.find.found`);
        } else {
            context.stat.increment(`datasource.mongoose.find.missing`);
        }
        return result;
    }
}
