module.exports = function createDeleteHandler(key, shape) {
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
    async function remove(source, args, context) {
        context.log.stat.increment(`datasource.<%= name %>.delete.begin`);

        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        let removed;

        // TODO: Implement removal here

        if (removed) {
            context.log.stat.increment(`datasource.<%= name %>.delete.found`);
        } else {
            context.log.stat.increment(`datasource.<%= name %>.delete.missing`);
        }
        context.log.stat.increment(`datasource.<%= name %>.delete.complete`);
        return removed;
    }

};