describe(`update`, () => {
    let createUpdate, update, context, doc, docRef, docData, collection, key, createKey;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpdate = require(`../src/update.js`);

        docData = {
            foo: 1,
            bar: 1
        };
        docRef = {
            exists: true,
            data: () => docData
        };
        doc = {
            get: jest.fn(() => docRef),
            update: jest.fn()
        };
        collection = {
            doc: jest.fn(() => doc)
        };
        key = Symbol(`find-key`);
        createKey = jest.fn(() => key);
        update = createUpdate(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof update).toBe(`function`);
    });
    it(`should update the collection`, async () => {
        const data = { foo: 1 };
        await update(undefined, { input: data }, context);
        expect(collection.doc.mock.calls.length).toBe(1);
        expect(collection.doc.mock.calls[0][0]).toBe(key);
        expect(doc.update.mock.calls.length).toBe(1);
        expect(doc.update.mock.calls[0][0]).toEqual(data);
    });
    it(`should return the updated document`, async () => {
        const result = await update(undefined, { input: { foo: 1 } }, context);;
        expect(result).toEqual(docData);
    });
});