describe(`find`, () => {
    let find, doc, docRef, docData, collection, key, createKey, context;
    beforeEach(() => {
        context = require(`./context.js`);
        const createFind = require(`../src/find.js`);
        docData = {
            foo: 1,
            bar: 1
        };
        docRef = {
            exists: true,
            data: () => docData
        };
        doc = {
            get: jest.fn(() => docRef)
        };
        collection = {
            doc: jest.fn(() => doc)
        };
        key = Symbol(`find-key`);
        createKey = jest.fn(() => key);
        find = createFind(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof find).toBe(`function`);
    });
    it(`should use the value of args.input to find the record`, async () => {
        const search = { foo: 1 };
        const record = await find(undefined, { input: search }, context);

        expect(createKey.mock.calls.length).toBe(1);
        expect(createKey.mock.calls[0][0]).toEqual(search);

        expect(collection.doc.mock.calls.length).toBe(1);
        expect(collection.doc.mock.calls[0][0]).toBe(key);

        expect(doc.get.mock.calls.length).toBe(1);

        expect(record).toEqual(docData);
    });
    it(`should return undefined if no record exists`, async () => {
        docRef.exists = false;
        const record = await find(undefined, { input: { foo: 1 } }, context);
        expect(record).toBe(undefined);
    });
});