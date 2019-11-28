module.exports = createListValidator;

const assert = require(`assert`);

async function createListValidator(resolvers, source, context, info, tenantId) {
    // TODO: Improve assertion error messages
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                tenantId,
                uid: `clint-eastwood`,
                email: `clint-eastwood@example.com`
            }
        }, context, info);
        cleanup.push(document1.uid);

        const document2 = await resolvers.create(source, {
            input: {
                tenantId,
                uid: `morgan-freeman`,
                email: `morgan-freeman@example.com`
            }
        }, context, info);
        cleanup.push(document2.uid);

        const document3 = await resolvers.create(source, {
            input: {
                tenantId,
                uid: `michael-cain`,
                email: `michael-cain@example.com`
            }
        }, context, info);
        cleanup.push(document3.uid);

        const document4 = await resolvers.create(source, {
            input: {
                tenantId,
                uid: `leonardo-dicaprio`,
                email: `leonardo-dicaprio@example.com`
            }
        }, context, info);
        cleanup.push(document4.uid);

        // Check no paging or filters
        const results1 = await resolvers.list(source, { input: { tenantId } }, context, info);
        assert.equal(results1.edges.length, 4);
        assert.equal(results1.edges[0].node.uid, `clint-eastwood`);
        assert.equal(results1.edges[1].node.uid, `leonardo-dicaprio`);
        assert.equal(results1.edges[2].node.uid, `michael-cain`);
        assert.equal(results1.edges[3].node.uid, `morgan-freeman`);

        // Check after
        const results2 = await resolvers.list(source, {
            input: {
                tenantId,
                after: results1.edges[0].cursor
            }
        }, context, info);
        assert.equal(results2.edges.length, 3, `Expected after to filter any records from the start until it matched one, ` +
            `the incorrect number of records was returned. Expected ${results2.edges.length} == 3`);
        assert.equal(results2.edges[0].node.uid, `leonardo-dicaprio`);
        assert.equal(results2.edges[1].node.uid, `michael-cain`);
        assert.equal(results2.edges[2].node.uid, `morgan-freeman`);

        // Skip before, not supported

        // Check first
        const results5 = await resolvers.list(source, {
            input: {
                tenantId,
                first: 2
            }
        }, context, info);
        assert.equal(results5.edges.length, 2);
        assert.equal(results5.edges[0].node.uid, `clint-eastwood`);
        assert.equal(results5.edges[1].node.uid, `leonardo-dicaprio`);

        // Skip last alone, not supported

        // Check first bigger than last
        const results7 = await resolvers.list(source, {
            input: {
                tenantId,
                first: 3,
                last: 2
            }
        }, context, info);
        assert.equal(results7.edges.length, 2);
        assert.equal(results7.edges[0].node.uid, `leonardo-dicaprio`);
        assert.equal(results7.edges[1].node.uid, `michael-cain`);

        // Skip last bigger than first, no supported

        // Check after with first
        const results9 = await resolvers.list(source, {
            input: {
                tenantId,
                after: results1.edges[0].cursor,
                first: 2
            }
        }, context, info);
        assert.equal(
            results9.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one ` +
            `and first to limit the result to 2, but the incorrect number of records ` +
            `was returned. Expected ${results9.edges.length} == 2`
        );
        assert.equal(results9.edges[0].node.uid, `leonardo-dicaprio`);
        assert.equal(results9.edges[1].node.uid, `michael-cain`);

        // Skip after with last, not supported

        // Check after with first bigger than last
        const results11 = await resolvers.list(source, {
            input: {
                tenantId,
                after: results1.edges[0].cursor,
                first: 3,
                last: 2
            }
        }, context, info);
        assert.equal(
            results11.edges.length,
            2,
            `Expected after to filter any records from the start until it matched one, ` +
            `first to select the first 3 records from that set, and last to return the ` +
            `last 2 records from that set, but the incorrect number of records was ` +
            `returned. Expected ${results11.edges.length} == 2`
        );
        assert.equal(results11.edges[0].node.uid, `michael-cain`);
        assert.equal(results11.edges[1].node.uid, `morgan-freeman`);

        // Skip after with last bigger than first, not supported

        // Skip after with before, not supported

        // Skip after with before and first, not supported

        // Skip after with before and first bigger than last, not supported

        // Skip after with before and last bigger than first, not supported

        result = true;
    } catch (ex) {
        console.error(`List validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
