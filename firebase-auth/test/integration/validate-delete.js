module.exports = createDeleteValidator;

const assert = require(`assert`);

async function createDeleteValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    try {
        const document1 = await resolvers.create(source, {
            input: {
                email: `clint-eastwood@example.com`
            }
        }, context, info);

        const result = await resolvers.delete(
            source,
            { input: { uid: document1.uid } },
            context,
            info
        );

        // assert.deepStrictEqual(result, document1, `Deleted document return did not match create return`);
        assert.deepStrictEqual(result, document1);

        const remaining = await resolvers.find(
            source,
            { input: { uid: document1.uid } },
            context,
            info
        );
        assert(!remaining, `The user with id "${document1.uid}" was not deleted`);

        return true;
    } catch (ex) {
        console.error(`Delete validation failed. ${ex.stack}`); // eslint-disable-line no-console
        return false;
    }
}
