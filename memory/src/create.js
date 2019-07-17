module.exports = createCreateHandler;

const { mold } = require(`./common.js`);

function createCreateHandler(key, shape, data) {
    return create;

    /**
     * Creates a new record in the data source. This record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     * @param {object} context The context the resolver is being executed in
     * @param {object} context.log The logging object
     * @param {object} context.log.stat The stats object
     * @param {function} context.log.stat.increment The function called to increment creation stats
     * @throws When args.input is not an object, or when shape is supplied and args.input does not match it
     */
    function create(source, args, context) {
        context.log.stat.increment(`datasource.memory.create.begin`);
        
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        
        const record = mold(args.input, shape);
        data.push(record);
        context.log.stat.increment(`datasource.memory.create.complete`);
        
        return record;
    }

};