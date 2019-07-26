describe(`upsert`, () => {
    let createUpsert, upsert, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpsert = require(`../src/upsert.js`);
        upsert = createUpsert();
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should create the record if it cannot be found`, async () => {
        await upsert(undefined, { input: { foo: 10, bar: 10, content: 'test' } }, context);

        // TODO: Check that the correct data has been created
        expect(false).toBe(true);
    });
    it(`should replace the record if it is found`, async () => {
        await upsert(undefined, { input: { foo: 2, bar: 1, content: `foo bar` } }, context);

        // TODO: Check that the correct data has been replaced
        expect(false).toBe(true);
    });
    it(`should ensure required fields as defined by the shape exist`, () => {
        const shape = {
            foo: true,
            bar: false,
            baz: {
                hello: false,
                world: false
            }
        };
        upsert = createUpsert([`foo`, `bar`], shape);

        const input = {
            bar: 10
        };
        expect(upsert(undefined, { input }, context)).rejects.toMatch(/required/i);
        input.foo = 100;
        await upsert(undefined, { input }, context); // Ensure it doesn't throw
    });
    it(`should only store data that is defined on the shape`, () => {
        const shape = { foo: true };
        upsert = createUpsert([`foo`, `bar`], shape);
        upsert(undefined, { input: { foo: 1, bar: 1 } }, context);

        // TODO: Check that only data defined in the shape has been stored
        expect(false).toBe(true);
    });
});