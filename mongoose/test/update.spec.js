describe(`update`, () => {
    let createUpdate, update, context, docData, collection, key, createKey;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpdate = require(`../src/update.js`);

        docData = {
            foo: 1,
            bar: 1
        };
        collection = {
            findOneAndUpdate: jest.fn(() => Promise.resolve(docData))
        };
        key = Symbol(`find-key`);
        createKey = jest.fn(() => key);
        update = createUpdate(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof update).toBe(`function`);
    });
    it(`should update the collection`, async () => {
        await update(undefined, { input: docData }, context);
        expect(collection.findOneAndUpdate.mock.calls.length).toBe(1);
        expect(collection.findOneAndUpdate.mock.calls[0][0]).toEqual({ _id: key });
        expect(collection.findOneAndUpdate.mock.calls[0][1]).toEqual({ $set: docData });
    });
    it(`should return the updated document`, async () => {
        const result = await update(undefined, { input: docData }, context);
        expect(result).toEqual(docData);
    });
});