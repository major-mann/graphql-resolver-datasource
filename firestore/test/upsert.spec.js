describe(`upsert`, () => {
    let createUpsert, upsert, context, doc, collection, key, createKey;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpsert = require(`../src/upsert.js`);
        doc = {
            set: jest.fn(),
            update: jest.fn()
        };
        collection = {
            doc: jest.fn(() => doc)
        };
        key = Symbol(`find-key`);
        createKey = jest.fn(() => key);
        upsert = createUpsert(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should call set with merge == false`, async () => {
        const data = { foo: 1 };
        await upsert(undefined, { input: data }, context);

        expect(collection.doc.mock.calls.length).toBe(1);
        expect(collection.doc.mock.calls[0][0]).toBe(key);

        expect(doc.set.mock.calls.length).toBe(1);
        expect(doc.set.mock.calls[0][0]).toEqual(data);
        expect(doc.set.mock.calls[0][1]).toEqual({ merge: false });
    });
});