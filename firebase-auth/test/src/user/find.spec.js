describe(`find`, () => {
    let find, context, auth, user, createFind;
    beforeEach(() => {
        context = require(`../../context.js`);
        createFind = require(`../../../src/user/find.js`);
        user = Symbol(`user`);
        auth = {
            getUser: jest.fn(() => user)
        };
        find = createFind(() => auth);
    });

    it(`should be a function`, () => {
        expect(typeof find).toBe(`function`);
    });
    it(`should use the value of args.input to find the record`, async () => {
        await find(undefined, { input: { uid: 123 } }, context);
        expect(auth.getUser.mock.calls.length).toBe(1);
        expect(auth.getUser.mock.calls[0][0]).toBe(123);
    });
    it(`should return a record that matches the supplied input if one exists`, async () => {
        const record = await find(undefined, { input: { foo: 2, bar: 1 } }, context);
        expect(record).toBe(user);
    });
    it(`should pass the supplied tenant id to the loadAuth function`, async () => {
        const tenantId = `test-tenant-id`;
        const loadAuth = jest.fn(() => auth);
        find = createFind(loadAuth, find);
        await find(undefined, { input: { uid: 123, tenantId } }, context);
        expect(loadAuth.mock.calls.length).toBe(1);
        expect(loadAuth.mock.calls[0][0]).toEqual(tenantId);
    });
});