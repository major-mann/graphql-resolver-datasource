module.exports = createDeleteValidator;

const assert = require(`assert`);

async function createDeleteValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    try {
        const document1 = await resolvers.create(source, {
            input: {
                name: `Clint Eastwood`,
                movies: [`Dirty Harry`, `Escape from Alcatraz`]
            }
        }, context, info);

        const result = await resolvers.delete(
            source,
            { input: { entertainerId: document1.entertainerId } },
            context,
            info
        );
        // assert.deepStrictEqual(result, document1, `Deleted document return did not match create return`);
        assert.deepStrictEqual(result, document1);

        const remaining = await resolvers.find(
            source,
            { input: { entertainerId: document1.entertainerId } },
            context,
            info
        );
        assert(!remaining, `The document with id "${document1.entertainerId}" was not deleted`);

        return true;
    } catch (ex) {
        console.error(`Delete validation failed. ${ex.stack}`); // eslint-disable-line no-console
        return false;
    }
}
