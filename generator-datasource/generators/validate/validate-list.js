module.exports = createListValidator;

const assert = require(`assert`);

async function createListValidator(resolvers, source, context, info) {
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

        const document4 = await resolvers.create(source, {
            input: {
                entertainerId: `leonardo-dicaprio`,
                name: `Leonardo Dicaprio`,
                movies: [`Titanic`, `Wolf of Wall Street`]
            }
        }, context, info);
        cleanup.push(document4.entertainerId);

        // Check no paging or filters
        const order = [{ field: `entertainerId`, desc: false }];
        const results1 = await resolvers.list(source, { order }, context, info);
        assert.equal(results1.edges.length, 4);
        assert.equal(results1.edges[0].node.entertainerId, `clint-eastwood`);
        assert.equal(results1.edges[1].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results1.edges[2].node.entertainerId, `michael-cain`);
        assert.equal(results1.edges[3].node.entertainerId, `morgan-freeman`);

        // Check after
        const results2 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            order
        }, context, info);
        assert.equal(results2.edges.length, 3, `Expected after to filter any records from the start until it matched one, ` +
            `the incorrect number of records was returned. Expected ${results2.edges.length} == 3`);
        assert.equal(results2.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results2.edges[1].node.entertainerId, `michael-cain`);
        assert.equal(results2.edges[2].node.entertainerId, `morgan-freeman`);

        // Check before
        const results3 = await resolvers.list(source, {
            before: results1.edges[3].cursor,
            order
        }, context, info);
        assert.equal(results3.edges.length, 3);
        assert.equal(results3.edges[0].node.entertainerId, `clint-eastwood`);
        assert.equal(results3.edges[1].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results3.edges[2].node.entertainerId, `michael-cain`);

        // Check after and before combined
        const results4 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            before: results1.edges[3].cursor,
            order
        }, context, info);
        assert.equal(results4.edges.length, 2);
        assert.equal(results4.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results4.edges[1].node.entertainerId, `michael-cain`);

        // Check first
        const results5 = await resolvers.list(source, {
            first: 2,
            order
        }, context, info);
        assert.equal(results5.edges.length, 2);
        assert.equal(results5.edges[0].node.entertainerId, `clint-eastwood`);
        assert.equal(results5.edges[1].node.entertainerId, `leonardo-dicaprio`);

        // Check last
        const results6 = await resolvers.list(source, {
            last: 2,
            order
        }, context, info);
        assert.equal(results6.edges.length, 2);
        assert.equal(results6.edges[0].node.entertainerId, `michael-cain`);
        assert.equal(results6.edges[1].node.entertainerId, `morgan-freeman`);

        // Check first bigger than last
        const results7 = await resolvers.list(source, {
            first: 3,
            last: 2,
            order
        }, context, info);
        assert.equal(results7.edges.length, 2);
        assert.equal(results7.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results7.edges[1].node.entertainerId, `michael-cain`);

        // Check last bigger than first
        const results8 = await resolvers.list(source, {
            first: 2,
            last: 3,
            order
        }, context, info);
        assert.equal(results8.edges.length, 2);
        assert.equal(results8.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results8.edges[1].node.entertainerId, `michael-cain`);

        // Check after with first
        const results9 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            first: 2,
            order
        }, context, info);
        assert.equal(
            results9.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one ` +
            `and first to limit the result to 2, but the incorrect number of records ` +
            `was returned. Expected ${results9.edges.length} == 2`
        );
        assert.equal(results9.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results9.edges[1].node.entertainerId, `michael-cain`);

        // Check after with last
        const results10 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            last: 2,
            order
        }, context, info);
        assert.equal(
            results10.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one ` +
            `and last to return the last 2 records from that set, but the incorrect ` +
            `number of records was returned. Expected ${results10.edges.length} == 2`
        );
        assert.equal(results10.edges[0].node.entertainerId, `michael-cain`);
        assert.equal(results10.edges[1].node.entertainerId, `morgan-freeman`);

        // Check after with first bigger than last
        const results11 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            first: 3,
            last: 2,
            order
        }, context, info);
        assert.equal(
            results11.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one, ` +
            `first to select the first 3 records from that set, and last to return the ` +
            `last 2 records from that set, but the incorrect number of records was ` +
            `returned. Expected ${results11.edges.length} == 2`
        );
        assert.equal(results11.edges[0].node.entertainerId, `michael-cain`);
        assert.equal(results11.edges[1].node.entertainerId, `morgan-freeman`);

        // Check after with last bigger than first
        // Note: This is a bit of a useless test. After has no real effect
        const results12 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            first: 2,
            last: 3,
            order
        }, context, info);
        assert.equal(
            results12.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one, ` +
            `last to select the last 3 records from that set, and first to return the ` +
            `first 2 records from that set, but the incorrect number of records was ` +
            `returned. Expected ${results12.edges.length} == 2`
        );
        assert.equal(results12.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results12.edges[1].node.entertainerId, `michael-cain`);

        // Check after with before
        const results13 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            before: results1.edges[3].cursor,
            order
        }, context, info);
        assert.equal(
            results13.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one, ` +
            `and before to do the same from the end, but the incorrect number of records was ` +
            `returned. Expected ${results13.edges.length} == 2`
        );
        assert.equal(results13.edges[0].node.entertainerId, `leonardo-dicaprio`);
        assert.equal(results13.edges[1].node.entertainerId, `michael-cain`);

        // Check after with before and first
        const results14 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            before: results1.edges[3].cursor,
            first: 1,
            order
        }, context, info);
        assert.equal(
            results14.edges.length,
            1,
            `Expected after to filter any records from the start until it matched one, ` +
            `before to do the same from the end, and first to limit the result of that ` +
            `but the incorrect number of records was returned. Expected ` +
            `${results14.edges.length} == 1`
        );
        assert.equal(results14.edges[0].node.entertainerId, `leonardo-dicaprio`);

        // Check after with before and first bigger than last
        const results15 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            before: results1.edges[3].cursor,
            first: 2,
            last: 1,
            order
        }, context, info);
        assert.equal(
            results15.edges.length,
            1,
            `Expected after to filter any records from the start until it matched one, ` +
            `before to do the same from the end, first to limit the result of that, and last ` +
            `to pick up the last records but the incorrect number of records was returned. Expected ` +
            `${results15.edges.length} == 1`
        );
        assert.equal(results15.edges[0].node.entertainerId, `michael-cain`);

        // Check after with before and last bigger than first
        const results16 = await resolvers.list(source, {
            after: results1.edges[0].cursor,
            before: results1.edges[3].cursor,
            first: 1,
            last: 2,
            order
        }, context, info);
        assert.equal(
            results16.edges.length,
            1,
            `Expected after to filter any records from the start until it matched one, ` +
            `before to do the same from the end, last to limit the result of that, and first ` +
            `to pick up the first records but the incorrect number of records was returned. Expected ` +
            `${results16.edges.length} == 1`
        );
        assert.equal(results16.edges[0].node.entertainerId, `leonardo-dicaprio`);
        result = true;
    } catch (ex) {
        console.error(`List validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            entertainerId => resolvers.delete(source, { input: { entertainerId } }, context, info)
        )
    );
    return result;
}
