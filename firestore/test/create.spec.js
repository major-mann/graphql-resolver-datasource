describe(`create`, () => {
    let createCreate, create, collection, doc, autoGenerate, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createCreate = require(`../src/create.js`);
        doc = {
            create: jest.fn()
        };
        collection = {
            doc: jest.fn(() => doc)
        };
        autoGenerate = jest.fn();
        create = createCreate(collection, doc => doc.foo, autoGenerate);
    });

    it(`should be a function`, () => {
        expect(typeof create).toBe(`function`);
    });
    it(`should add a value to the data that is defined in input.data`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        await create(undefined, { input: record }, context);
        expect(collection.doc.mock.calls.length).toBe(1);
        expect(collection.doc.mock.calls[0][0]).toEqual(1);

        expect(doc.create.mock.calls.length).toBe(1);
        expect(doc.create.mock.calls[0][0]).toEqual(record);
    });
    it(`should return the created record`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        const result = await create(undefined, { input: record }, context);
        expect(result).toEqual(record);
    });
    it(`should call autoGenerate to allow values to be auto generated`, async () => {
        const record = {
            foo: 1,
            bar: 1
        };
        await create(undefined, { input: record }, context);
        expect(autoGenerate.mock.calls.length).toBe(1);
        expect(autoGenerate.mock.calls[0][0]).toEqual(record);
    });
});