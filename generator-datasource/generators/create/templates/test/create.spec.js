describe(`create`, () => {
    let createCreate, create, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        createCreate = require(`../src/create.js`);
        create = createCreate([`foo`, `bar`], undefined);
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
        // TODO: Check that result matches the record in the data store
        expect(false).toBe(true);
    });
    it(`should ensure required fields as defined by the shape exist`, async () => {
        const shape = {
            foo: true,
            bar: false,
            baz: {
                hello: false,
                world: false
            }
        };
        create = await createCreate([`foo`, `bar`], shape, data);

        const input = {
            bar: 10
        };
        await expect(create(undefined, { input }, context)).rejects.toMatch(/required/i);
        input.foo = 100;
        await create(undefined, { input }, context);
    });
    it(`should only store data that is defined on the shape`, async () => {
        const shape = { foo: true };
        create = createCreate([`foo`, `bar`], shape, data);
        await create(undefined, { input: { foo: `hello`, bar: `world` } }, context);
        
        // TODO: Check that the record in the data store has the correct values
        expect(false).toBe(true);
    });
});