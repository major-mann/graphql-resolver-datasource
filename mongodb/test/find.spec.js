describe(`find`, () => {
    let find, doc, query, collection, key, createKey, context;
    beforeEach(() => {
        context = require(`./context.js`);
        const createFind = require(`../src/find.js`);
        doc = Symbol(`document`);
        query = {
            limit: jest.fn(() => query),
            toArray: jest.fn(() => [doc])
        };
        collection = {
            find: jest.fn(() => query)
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

        expect(collection.find.mock.calls.length).toBe(1);
        expect(collection.find.mock.calls[0][0]).toEqual({ _id: key });
        expect(query.limit.mock.calls.length).toBe(1);
        expect(query.limit.mock.calls[0][0]).toBe(1);

        expect(record).toEqual(doc);
    });
});