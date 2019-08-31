describe(`update`, () => {
    let createUpdate, update, context, auth;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpdate = require(`../src/user/update.js`);
        auth = {
            updateUser: jest.fn()
        };
        update = createUpdate(auth);
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
});