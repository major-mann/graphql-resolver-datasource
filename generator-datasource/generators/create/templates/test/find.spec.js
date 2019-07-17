describe(`find`, () => {
    let find, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        const createFind = require(`../src/find.js`);
        const data = require(`./data.js`)();
        find = createFind([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof find).toBe(`function`);
    });
    it(`should use the value of args.input to find the record`, () => {
        const record = find(undefined, { input: { foo: 1, bar: 1 } }, context);
        expect(record.foo).toBe(1);
        expect(record.bar).toBe(1);
        expect(record.content).toBe(`nsync`);
    });
    it(`should return a record that matches the supplied input if one exists`, () => {
        const record = find(undefined, { input: { foo: 2, bar: 1 } }, context);
        expect(record.foo).toBe(2);
        expect(record.bar).toBe(1);
        expect(record.content).toBe(`britney spears`);
    });
    it(`should return undefined if no record exists`, () => {
        const record = find(undefined, { input: { foo: 2, bar: 2 } }, context);
        expect(record).toBe(undefined);
    });
});