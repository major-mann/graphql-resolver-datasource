module.exports = createUpdateValidator;

const assert = require(`assert`);

async function createUpdateValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                name: `Michael Cain`,
                nickname: `Mike`,
                movies: [`Dunkirk`, `The Dark Knight`]
            }
        }, context, info);
        cleanup.push(document1.entertainerId);
        const updated = await resolvers.update(source, {
            input: {
                entertainerId: document1.entertainerId,
                movies: [`Dunkirk`, `The Dark Knight`, `Batman Begins`]
            }
        }, context, info);
        assert(updated, `Expected the updated document to be returned`);
        assert.equal(updated.entertainerId, document1.entertainerId);
        assert.equal(updated.name, document1.name);
        assert.equal(updated.nickname, `Mike`);
        assert.equal(updated.movies.length, 3);

        result = true;
    } catch (ex) {
        console.error(`Update validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            entertainerId => resolvers.delete(source, { input: { entertainerId } }, context, info)
        )
    );
    return result;
}
