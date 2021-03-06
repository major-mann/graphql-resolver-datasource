module.exports = function createFindHandler() {
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
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        let record;

        // TODO: Implement find in your datasource here

        if (record) {
            context.stat.increment(`datasource.<%= name %>.find.found`);
        } else {
            context.stat.increment(`datasource.<%= name %>.find.missing`);
        }
        return record;
    }

};
