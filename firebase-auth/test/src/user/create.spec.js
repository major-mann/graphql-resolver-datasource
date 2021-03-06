describe(`create`, () => {
    let createCreate, create, context, auth;
    beforeEach(() => {
        context = require(`../../context.js`);
        createCreate = require(`../../../src/user/create.js`);
        auth = {
            createUser: jest.fn(record => record)
        };
        create = createCreate(() => auth);
    });

    it(`should be a function`, () => {
        expect(typeof create).toBe(`function`);
    });
    it(`should add a value to the data that is defined in input.data`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        await create(undefined, { input: record }, context);
        expect(auth.createUser.mock.calls.length).toBe(1);
        expect(auth.createUser.mock.calls[0][0]).toEqual(record);
    });
    it(`should return the created record`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        const result = await create(undefined, { input: record }, context);
        expect(auth.createUser.mock.calls.length).toBe(1);
        expect(auth.createUser.mock.calls[0][0]).toEqual(record);
        expect(result).toEqual(record);
    });
    it(`should pass the supplied tenant id to the loadAuth function`, async () => {
        const tenantId = `test-tenant-id`;
        const loadAuth = jest.fn(() => auth);
        create = createCreate(loadAuth);
        await create(undefined, { input: { tenantId } }, context);
        expect(loadAuth.mock.calls.length).toBe(1);
        expect(loadAuth.mock.calls[0][0]).toEqual(tenantId);
    });
});