module.exports = createFindValidator;

const assert = require(`assert`);

async function createFindValidator(resolvers, source, context, info, tenantId) {
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

        let succeeded = false;
        try {
            await resolvers.find(source, { input: { email: `michael-cain@example.com`, tenantId } }, context, info);
            succeeded = true;
        } catch (ex) {
            // Expected failure
        }
        assert(!succeeded, `Expected find to fail when the key fields are not supplied`);

        const findResult1 = await resolvers.find(
            source,
            { input: { uid: `michael-cain`, tenantId } },
            context,
            info
        );
        assert.deepStrictEqual(findResult1, document3);

        const findResult2 = await resolvers.find(
            source,
            { input: { uid: `clint-eastwood`, tenantId } },
            context,
            info
        );
        assert.deepStrictEqual(findResult2, document1);

        const findResult3 = await resolvers.find(
            source,
            { input: { uid: `someone-else`, tenantId } },
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
            uid => resolvers.delete(source, { input: { uid, tenantId } }, context, info)
        )
    );
    return result;
}
