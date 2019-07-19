module.exports = createCreateValidator;

const assert = require(`assert`);

async function createCreateValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                name: `Clint Eastwood`,
                movies: [`Dirty Harry`, `Escape from Alcatraz`]
            }
        }, context, info);
        cleanup.push(document1.entertainerId);

        assert(document1, `Expected the created document to be returned`);
        assert(document1.entertainerId, `Expected entertainerId to be generated`);
        assert.equal(document1.name, `Clint Eastwood`);

        assert(Array.isArray(document1.movies), `Expected movies property to be an array`);
        assert.equal(document1.movies[0], `Dirty Harry`);
        assert.equal(document1.movies[1], `Escape from Alcatraz`);
        result = true;
    } catch (ex) {
        console.error(`Create validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            entertainerId => resolvers.delete(source, { input: { entertainerId } }, context, info)
        )
    );
    return result;
}
