describe(`create`, () => {
    let createCreate, create, data, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        createCreate = require(`../src/create.js`);
        data = [];
        create = createCreate([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof create).toBe(`function`);
    });
    it(`should add a value to the data that is defined in input.data`, () => {
        const record = {
            foo: 1,
            bar: 1
        };
        create(undefined, { input: record }, context);
        expect(data[0]).toEqual(record);
    });
    it(`should return the created record`, () => {
        const record = {
            foo: 1,
            bar: 1
        };
        const result = create(undefined, { input: record }, context);
        expect(result).toEqual(data[0]);
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
        create = createCreate([`foo`, `bar`], shape, data);

        const input = {
            bar: 10
        };
        expect(() => create(undefined, { input }, context)).toThrow(/required/i);
        input.foo = 100;
        expect(() => create(undefined, { input }, context)).not.toThrow(/required/i);
    });
    it(`should only store data that is defined on the shape`, () => {
        const shape = { foo: true };
        create = createCreate([`foo`, `bar`], shape, data);
        create(undefined, { input: { foo: `hello`, bar: `world` } }, context);
        expect(data[0].foo).toBe(`hello`);
        expect(data[0].bar).toBe(undefined);
    });
});