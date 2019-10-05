describe(`upsert`, () => {
    let createUpsert, upsert, context, docData, collection, key, createKey;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpsert = require(`../src/upsert.js`);
        docData = {
            foo: 1
        };
        collection = {
            findOneAndReplace: jest.fn(() => Promise.resolve(docData))
        };
        key = Symbol(`find-key`);
        createKey = jest.fn(() => key);
        upsert = createUpsert(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should call set with merge == false`, async () => {
        await upsert(undefined, { input: docData }, context);

        expect(collection.findOneAndReplace.mock.calls.length).toBe(1);
        expect(collection.findOneAndReplace.mock.calls[0][0]).toEqual({ _id: key });
        expect(collection.findOneAndReplace.mock.calls[0][1]).toEqual({ _id: key, ...docData });
    });
});