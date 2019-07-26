describe(`create`, () => {
    let createCreate, create, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createCreate = require(`../src/create.js`);
        create = createCreate();
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
        // TODO: Check that the record was inserted correctly
        expect(false).toBe(true);
    });
    it(`should return the created record`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        const result = await create(undefined, { input: record }, context);
        expect(result).toEqual(record);
    });
});