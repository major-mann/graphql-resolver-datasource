describe(`find`, () => {
    let find, doc, collection, key, createKey, context;
    beforeEach(() => {
        context = require(`./context.js`);
        const createFind = require(`../src/find.js`);
        doc = Symbol(`document`);
        collection = {
            findOne: jest.fn(() => Promise.resolve(doc))
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

        expect(collection.findOne.mock.calls.length).toBe(1);
        expect(collection.findOne.mock.calls[0][0]).toEqual({ _id: key });

        expect(record).toEqual(doc);
    });
});