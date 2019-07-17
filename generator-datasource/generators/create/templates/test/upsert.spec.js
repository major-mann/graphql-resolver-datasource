describe(`upsert`, () => {
    let createUpsert, upsert, data, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        createUpsert = require(`../src/upsert.js`);
        data = require(`./data.js`)();
        upsert = createUpsert([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should create the record if it cannot be found`, () => {
        const cnt = data.length;
        upsert(undefined, { input: { foo: 10, bar: 10, content: 'test' } }, context);
        expect(data.length).toBe(cnt + 1);
        expect(data[data.length - 1].content).toBe(`test`);
    });
    it(`should replace the record if it is found`, () => {
        upsert(undefined, { input: { foo: 2, bar: 1, content: `foo bar` } }, context);
        expect(data[2].content).toBe(`foo bar`);
        expect(data[2].aka).toBe(undefined);
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
        upsert = createUpsert([`foo`, `bar`], shape, data);

        const input = {
            bar: 10
        };
        expect(() => upsert(undefined, { input }, context)).toThrow(/required/i);
        input.foo = 100;
        expect(() => upsert(undefined, { input }, context)).not.toThrow(/required/i);
    });
    it(`should only store data that is defined on the shape`, () => {
        const shape = { foo: true };
        upsert = createUpsert([`foo`, `bar`], shape, data);
        data.length = 0;
        upsert(undefined, { input: { foo: 1, bar: 1 } }, context);
        expect(data[0].foo).toBe(1);
        expect(data[0].bar).toBe(undefined);
    });
});