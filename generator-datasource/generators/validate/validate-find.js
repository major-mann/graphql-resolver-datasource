module.exports = createFindValidator;

const assert = require(`assert`);

async function createFindValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                entertainerId: `clint-eastwood`,
                name: `Clint Eastwood`,
                movies: [`Dirty Harry`, `Escape from Alcatraz`]
            }
        }, context, info);
        cleanup.push(document1.entertainerId);

        const document2 = await resolvers.create(source, {
            input: {
                entertainerId: `morgan-freeman`,
                name: `Morgan Freeman`,
                movies: [`Shawshank Redemption`, `Seven`]
            }
        }, context, info);
        cleanup.push(document2.entertainerId);

        const document3 = await resolvers.create(source, {
            input: {
                entertainerId: `michael-cain`,
                name: `Michael Cain`,
                nickname: `Mike`,
                movies: [`Dunkirk`, `The Dark Knight`]
            }
        }, context, info);
        cleanup.push(document3.entertainerId);

        try {
            await resolvers.find(source, { input: { name: `Michael Cain` } }, context, info);
        } catch (ex) {
            assert.fail(`Expected find to fail when the key fields are not supplied`);
        }

        const findResult1 = await resolvers.find(
            source,
            { input: { entertainerId: `michael-cain` } },
            context,
            info
        );
        assert.deepStrictEqual(findResult1, document3);

        const findResult2 = await resolvers.find(
            source,
            { input: { entertainerId: `clint-eastwood` } },
            context,
            info
        );
        assert.deepStrictEqual(findResult2, document1);

        const findResult3 = await resolvers.find(
            source,
            { input: { entertainerId: `someone-else` } },
            context,
            info
        );
        assert.equal(findResult3, undefined);
        result = true;
    } catch (ex) {
        console.error(`Find validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            entertainerId => resolvers.delete(source, { input: { entertainerId } }, context, info)
        )
    );
    return result;
}
