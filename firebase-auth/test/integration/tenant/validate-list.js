module.exports = createTenantListValidator;

const assert = require(`assert`);

async function createTenantListValidator(resolvers, source, context, info) {
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-1`
            }
        }, context, info);
        cleanup.push(document1.tenantId);

        const document2 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-2`
            }
        }, context, info);
        cleanup.push(document2.tenantId);

        const document3 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-3`
            }
        }, context, info);
        cleanup.push(document3.tenantId);

        const document4 = await resolvers.tenantCreate(source, {
            input: {
                displayName: `test-tenant-4`
            }
        }, context, info);
        cleanup.push(document4.tenantId);

        // Check no paging or filters
        const results1 = await resolvers.tenantList(source, { input: { } }, context, info);
        assert.equal(results1.edges.length >= 4, true);
        if (results1.edges.length < 100) {
            assert(
                results1.edges.find(
                    edge => edge.node.displayName === `test-tenant-1`
                ),
                `Expected to find test-tenant-1 in the results`
            );
            assert(
                results1.edges.find(
                    edge => edge.node.displayName === `test-tenant-2`
                ),
                `Expected to find test-tenant-2 in the results`
            );
            assert(
                results1.edges.find(
                    edge => edge.node.displayName === `test-tenant-3`
                ),
                `Expected to find test-tenant-3 in the results`
            );
            assert(
                results1.edges.find(
                    edge => edge.node.displayName === `test-tenant-4`
                ),
                `Expected to find test-tenant-4 in the results`
            );
        }

        // Check after
        const results2 = await resolvers.tenantList(source, {
            input: {
                after: results1.edges[0].cursor
            }
        }, context, info);

        if (results2.edges.length < 100) {
            assert(
                !results1.edges.find(
                    edge => edge.node.displayName === results1.edges[0].displayName
                ),
                `Expected not to find ${results1.edges[0].displayName} in the results`
            );
        }

        // Skip before, not supported

        // Check first
        const results5 = await resolvers.tenantList(source, {
            input: {
                first: 2
            }
        }, context, info);
        assert.equal(results5.edges.length, 2);
        assert.equal(results5.edges[0].node.tenantId, results1.edges[0].node.tenantId);
        assert.equal(results5.edges[1].node.tenantId, results1.edges[1].node.tenantId);

        // Skip last alone, not supported

        // Check first bigger than last
        const results7 = await resolvers.tenantList(source, {
            input: {
                first: 3,
                last: 2
            }
        }, context, info);
        assert.equal(results7.edges.length, 2);
        assert.equal(results7.edges[0].node.tenantId, results1.edges[1].node.tenantId);
        assert.equal(results7.edges[1].node.tenantId, results1.edges[2].node.tenantId);

        // Skip last bigger than first, no supported

        // Check after with first
        const results9 = await resolvers.tenantList(source, {
            input: {
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
        assert.equal(results9.edges[0].node.tenantId, results1.edges[1].node.tenantId);
        assert.equal(results9.edges[1].node.tenantId, results1.edges[2].node.tenantId);

        // Skip after with last, not supported

        // Check after with first bigger than last
        const results11 = await resolvers.tenantList(source, {
            input: {
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
        assert.equal(results11.edges[0].node.tenantId, results1.edges[2].node.tenantId);
        assert.equal(results11.edges[1].node.tenantId, results1.edges[3].node.tenantId);

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
            tenantId => resolvers.tenantDelete(source, { input: { tenantId } }, context, info)
        )
    );
    return result;
}
