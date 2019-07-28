module.exports = function createDeleteHandler() {
    return remove;

    /**
     * Removes a record from the data store
     * @param {*} source Unused
     * @param {object} args The arguments to create or replace the entity with
     * @param {object} args.input The document to create or replace
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.stat The stats object
     * @param {function} context.stat.increment The function called to increment upsertion stats
     * @throws When args.input is not an object
     */
    async function remove(source, args, context) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }

        let removed;

        // TODO: Implement removal here

        if (removed) {
            context.stat.increment(`datasource.<%= name %>.delete.found`);
        } else {
            context.stat.increment(`datasource.<%= name %>.delete.missing`);
        }
        return removed;
    }

};
