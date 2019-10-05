describe(`delete`, () => {
    let doc, remove, context, collection;
    beforeEach(() => {
        context = require(`./context.js`);
        const createDelete = require(`../src/delete.js`);
        doc = Symbol(`doc-data`);
        collection = {
            findOneAndDelete: jest.fn(() => Promise.resolve(doc))
        };
        remove = createDelete(collection, doc => doc.foo);
    });

    it(`should be a function`, () => {
        expect(typeof remove).toBe(`function`);
    });
    it(`should remove the item with the specified key`, async () => {
        await remove(undefined, { input: { foo: 1 } }, context);
        expect(collection.findOneAndDelete.mock.calls.length).toBe(1);
        expect(collection.findOneAndDelete.mock.calls[0][0]).toEqual({ _id: 1 });
    });
    it(`should return removed record`, async () => {
        const removed = await remove(undefined, { input: { foo: 1, bar: 2 } }, context);
        expect(removed).toBe(doc);
    });
});
