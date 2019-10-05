module.exports = createUpsertValidator;

const assert = require(`assert`);

async function createUpsertValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.upsert(source, {
            input: {
                entertainerId: `morgan-freeman`,
                name: `Morgan Freeman`,
                nickname: `Freeman`,
                movies: [`Shawshank Redemption`, `Seven`]
            }
        }, context, info);
        cleanup.push(document1.entertainerId);
        assert(document1, `Expected the upserted document to be returned`);
        assert.equal(document1.entertainerId, `morgan-freeman`);
        assert.equal(document1.name, `Morgan Freeman`);

        assert(Array.isArray(document1.movies), `Expected movies property to be an array`);
        assert.equal(document1.movies[0], `Shawshank Redemption`);
        assert.equal(document1.movies[1], `Seven`);

        const document2 = await resolvers.upsert(source, {
            input: {
                entertainerId: `morgan-freeman`,
                name: `Morgan`,
                movies: [`Shawshank Redemption`, `Seven`, `Lucy`]
            }
        }, context, info);

        const found = await resolvers.find(
            source,
            { input: { entertainerId: `morgan-freeman` } },
            context,
            info
        );
        assert(found, `Expected document to exist`);
        assert(!found.nickname, `Expected document to have been replaced`);
        assert.equal(found.entertainerId, document2.entertainerId);
        assert.equal(found.name, document2.name);

        assert.equal(found.movies.length, document2.movies.length);
        assert.equal(found.movies[0], document2.movies[0]);
        assert.equal(found.movies[1], document2.movies[1]);
        assert.equal(found.movies[2], document2.movies[2]);

        result = true;
    } catch (ex) {
        console.error(`Upsert validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            entertainerId => resolvers.delete(source, { input: { entertainerId } }, context, info)
        )
    );
    return result;
}
