describe(`update`, () => {
    let createUpdate, update, context, auth;
    beforeEach(() => {
        context = require(`../../context.js`);
        createUpdate = require(`../../../src/user/update.js`);
        auth = {
            updateUser: jest.fn()
        };
        update = createUpdate(() => auth);
    });

    it(`should be a function`, () => {
        expect(typeof update).toBe(`function`);
    });
    it(`should call update user with the supplied input`, async () => {
        const data = { uid: 123, foo: 1 };
        await update(undefined, { input: data  }, context);
        expect(auth.updateUser.mock.calls.length).toBe(1);
        expect(auth.updateUser.mock.calls[0][0]).toBe(123);
        expect(auth.updateUser.mock.calls[0][1]).toEqual(data);
    });
    it(`should pass the supplied tenant id to the loadAuth function`, async () => {
        const tenantId = `test-tenant-id`;
        const loadAuth = jest.fn(() => auth);
        update = createUpdate(loadAuth);
        const data = { uid: 123, foo: 1, tenantId };
        await update(undefined, { input: data }, context);
        expect(loadAuth.mock.calls.length).toBe(1);
        expect(loadAuth.mock.calls[0][0]).toEqual(tenantId);
    });
});