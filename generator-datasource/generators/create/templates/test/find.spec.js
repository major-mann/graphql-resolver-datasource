describe(`find`, () => {
    let find, context;
    beforeEach(() => {
        context = require(`./context.js`);
        const createFind = require(`../src/find.js`);
        find = createFind();
    });

    it(`should be a function`, () => {
        expect(typeof find).toBe(`function`);
    });
    it(`should use the value of args.input to find the record`, async () => {
        const record = await find(undefined, { input: { foo: 1, bar: 1 } }, context);
        expect(record.foo).toBe(1);
        expect(record.bar).toBe(1);

        // TODO: Check that the correct content has been loaded
        expect(record.content).toBe(`a test content value`);
    });
    it(`should return a record that matches the supplied input if one exists`, async () => {
        const record = await find(undefined, { input: { foo: 2, bar: 1 } }, context);
        expect(record.foo).toBe(2);
        expect(record.bar).toBe(1);

        // TODO: Check that the correct content has been loaded
        expect(record.content).toBe(`a test content value`);
    });
    it(`should return undefined if no record exists`, async () => {
        const record = await find(undefined, { input: { foo: 2, bar: 2 } }, context);
        expect(record).toBe(undefined);
    });
});