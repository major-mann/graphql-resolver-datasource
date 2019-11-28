describe(`upsert`, () => {
    let createUpsert, upsert, context, auth, find, found, emailFound, phoneNumberFound;
    beforeEach(() => {
        context = require(`../../context.js`);
        createUpsert = require(`../../../src/user/upsert.js`);

        auth = {
            importUsers: jest.fn(() => ({ errors: [] })),
            getUserByEmail: jest.fn(() => emailFound),
            getUserByPhoneNumber: jest.fn(() => phoneNumberFound)
        };

        found = {
            uid: Symbol(`uid`)
        };
        find = jest.fn(() => found);
        upsert = createUpsert(() => auth, find);
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });

    it(`should pass the supplied tenant id to the loadAuth function`, async () => {
        const tenantId = `test-tenant-id`;
        const loadAuth = jest.fn(() => auth);
        upsert = createUpsert(loadAuth, find);
        const data = { uid: 123, foo: 1, tenantId };
        await upsert(undefined, { input: data }, context);
        expect(loadAuth.mock.calls.length).toBe(1);
        expect(loadAuth.mock.calls[0][0]).toEqual(tenantId);
    });

    it(`should call importUsers with the supplied input`, async () => {
        const data = { uid: 123, foo: 1 };
        await upsert(undefined, { input: data  }, context);
        expect(auth.importUsers.mock.calls.length).toBe(1);
        expect(auth.importUsers.mock.calls[0][0]).toEqual([data]);
    });
});