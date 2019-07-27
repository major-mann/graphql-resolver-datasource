describe(`upsert`, () => {
    let createUpsert, upsert, context, find, update, create, exists;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpsert = require(`../src/upsert.js`);
        exists = false;
        find = jest.fn(() => exists);
        create = jest.fn();
        update = jest.fn();
        upsert = createUpsert(find, create, update);
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should create the record if it cannot be found`, async () => {
        await upsert(undefined, { input: { foo: 1 } }, context);
        expect(find.mock.calls.length).toBe(1);
        expect(create.mock.calls.length).toBe(1);
        expect(update.mock.calls.length).toBe(0);
    });
    it(`should replace the record if it is found`, async () => {
        exists = true;
        await upsert(undefined, { input: { foo: 1 } }, context);
        expect(find.mock.calls.length).toBe(1);
        expect(create.mock.calls.length).toBe(0);
        expect(update.mock.calls.length).toBe(1);
    });
});