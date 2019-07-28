describe(`delete`, () => {
    let doc, docResult, docData, remove, context, collection;
    beforeEach(() => {
        context = require(`./context.js`);
        const createDelete = require(`../src/delete.js`);
        docData = Symbol(`doc-data`);
        docResult = {
            exists: true,
            data: () => docData
        };
        doc = {
            get: () => docResult,
            delete: jest.fn()
        };
        collection = {
            doc: jest.fn(() => doc)
        };
        remove = createDelete(collection, doc => doc.foo);
    });

    it(`should be a function`, () => {
        expect(typeof remove).toBe(`function`);
    });
    it(`should remove the item with the specified key`, async () => {
        await remove(undefined, { input: { foo: 1 } }, context);
        expect(collection.doc.mock.calls.length).toBe(1);
        expect(collection.doc.mock.calls[0][0]).toEqual(1);

        expect(doc.delete.mock.calls.length).toBe(1);
        expect(doc.delete.mock.calls[0].length).toBe(0);
    });
    it(`should return removed record`, async () => {
        const removed = await remove(undefined, { input: { foo: 1, bar: 2 } }, context);
        expect(removed).toBe(docData);
    });
});
