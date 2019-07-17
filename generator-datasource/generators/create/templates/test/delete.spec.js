describe(`delete`, () => {
    let remove, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        const createDelete = require(`../src/delete.js`);
        remove = createDelete([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof remove).toBe(`function`);
    });
    it(`should remove the item with the specified key`, async () => {
        await remove(undefined, { input: { foo: 1, bar: 2 } }, context);

        // TODO: Check that record has been removed from the data store
        expect(false).toBe(true);
    });
    it(`should ignore any fields that are not part of the key`, async () => {
        await remove(undefined, { input: { foo: 1, bar: 2, content: `doesn't matter` } }, context);

        // TODO: Check that record has been removed from the data store
        expect(false).toBe(true);
    });
    it(`should return removed record`, async () => {
        let original;

        // TODO: Get the original data from the data store
        expect(false).toBe(true);

        const result = await remove(undefined, { input: { foo: 1, bar: 2 } }, context);
        expect(result).toEqual(original);
    });
});
