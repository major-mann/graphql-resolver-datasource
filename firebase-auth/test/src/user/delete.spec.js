describe(`delete`, () => {
    let remove, context, find, auth, found, createDelete;
    beforeEach(() => {
        context = require(`../../context.js`);
        createDelete = require(`../../../src/user/delete.js`);
        found = {
            uid: Symbol(`uid`)
        };
        find = jest.fn(() => found);
        auth = {
            deleteUser: jest.fn()
        };
        remove = createDelete(() => auth, find);
    });

    it(`should be a function`, () => {
        expect(typeof remove).toBe(`function`);
    });
    it(`should remove the item with the specified key`, async () => {
        await remove(undefined, { input: { uid: 123 } }, context);
        expect(find.mock.calls.length).toBe(1);
        expect(auth.deleteUser.mock.calls.length).toBe(1);
        expect(auth.deleteUser.mock.calls[0][0]).toBe(found.uid);
    });
    it(`should return removed record`, async () => {
        const result = await remove(undefined, { input: { uid: 123 } }, context);
        expect(result).toEqual(found);
    });
    it(`should pass the supplied tenant id to the loadAuth function`, async () => {
        const tenantId = `test-tenant-id`;
        const loadAuth = jest.fn(() => auth);
        remove = createDelete(loadAuth, find);
        await remove(undefined, { input: { uid: 123, tenantId } }, context);
        expect(loadAuth.mock.calls.length).toBe(1);
        expect(loadAuth.mock.calls[0][0]).toEqual(tenantId);
    });
});
