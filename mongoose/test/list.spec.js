describe(`list`, () => {
    let createList, list, context, collection, key, createKey, data;
    beforeEach(() => {
        context = require(`./context.js`);
        createList = require(`../src/list.js`);
        data = [
            { id: 1, name: `foo` },
            { id: 2, name: `bar` },
            { id: 3, name: `baz` }
        ];

        collection = {
            find: jest.fn(() => collection),
            sort: jest.fn(() => collection),
            limit: jest.fn(() => collection),
            exec: jest.fn(() => Promise.resolve(data))
        };

        key = `order-key`;
        createKey = jest.fn(() => key);
        list = createList(collection, createKey);
    });

    it(`should be a function`, () => {
        expect(typeof list).toBe(`function`);
    });

    it(`should return a connection structure`, async () => {
        const result = await list(undefined, { input: { } }, context);
        expect(result && typeof result).toBe(`object`);
        expect(result.pageInfo && typeof result.pageInfo).toBe(`object`);
        expect(typeof result.pageInfo.hasPreviousPage).toBe(`boolean`);
        expect(typeof result.pageInfo.hasNextPage).toBe(`boolean`);
        expect(Array.isArray(result.edges)).toBe(true);
    });
    it(`should return everything when no arguments are specified`, async () => {
        const result = await list(undefined, { input: { } }, context);
        expect(result.edges.length).toBe(3);
        result.edges.forEach((edge, index) => expect(edge.node).toEqual(data[index]));
    });
    it(`should put a filter with the relevant cursor value when after is specified`, async () => {
        let result = await list(undefined, { input: { } }, context);
        await list(undefined, { input: { after: result.edges[0].cursor } }, context);

        expect(collection.find.mock.calls.length).toBe(2);
        expect(typeof collection.find.mock.calls[1][0]).toBe(`object`);
        expect(typeof collection.find.mock.calls[1][0]._id).toBe(`object`);
        expect(collection.find.mock.calls[1][0]._id.$gt).toBe(key);
    });
    it(`should put a filter with the relevant cursor value when before is specified`, async () => {
        let result = await list(undefined, { input: { } }, context);
        await list(undefined, { input: { before: result.edges[0].cursor } }, context);

        expect(collection.find.mock.calls.length).toBe(2);
        expect(typeof collection.find.mock.calls[1][0]).toBe(`object`);
        expect(typeof collection.find.mock.calls[1][0]._id).toBe(`object`);
        expect(collection.find.mock.calls[1][0]._id.$lt).toBe(key);
    });
    it(`should return the no records when first is less than or equal to 0`, async () => {
        let result = await list(undefined, { input: { first: -11 } }, context);
        expect(result.edges.length).toBe(0);
        result = await list(undefined, { input: { first: 0 } }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should return the no records when last is less than or equal to 0`, async () => {
        let result = await list(undefined, { input: { last: -11 } }, context);
        expect(result.edges.length).toBe(0);
        result = await list(undefined, { input: { last: 0 } }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should call limit when first is supplied (and greater than last)`, async () => {
        await list(undefined, { input: { first: 2 } }, context);
        expect(collection.limit.mock.calls.length).toBe(1);
        expect(collection.limit.mock.calls[0][0]).toBeGreaterThanOrEqual(2);
    });
    it(`should return the last n records when last is specified`, async () => {
        await list(undefined, { input: { last: 2 } }, context);
        expect(collection.limit.mock.calls.length).toBe(1);
        expect(collection.limit.mock.calls[0][0]).toBeGreaterThanOrEqual(2);
    });
    it(`should return the last m records of the first n records when first and last are specified and first is bigger than last`, async () => {
        await list(undefined, { input: { first: 3, last: 2 } }, context);
        expect(collection.limit.mock.calls.length).toBe(1);
        expect(collection.limit.mock.calls[0][0]).toBeGreaterThanOrEqual(3);
    });
    it(`should return the first m records of the last n records when first and last are specified and last is bigger than first`, async () => {
        const result = await list(undefined, { input: { first: 2, last: 3 } }, context);
        expect(result.edges.length).toBe(2);
        expect(collection.limit.mock.calls.length).toBe(1);
        expect(collection.limit.mock.calls[0][0]).toBeGreaterThanOrEqual(3);
    });
    it(`should apply all order instructions to data`, async () => {
        const args = {
            input: {
                order: [
                    { field: `foo`, desc: true },
                    { field: `bar` },
                    { field: `content` }
                ]
            }
        };
        await list(undefined, args, context);
        expect(collection.sort.mock.calls.length).toBe(1);
        expect(typeof collection.sort.mock.calls[0][0]).toBe(`object`);
        expect(collection.sort.mock.calls[0][0].foo).toBe(-1);
        expect(collection.sort.mock.calls[0][0].bar).toBe(1);
        expect(collection.sort.mock.calls[0][0].content).toBe(1);
    });
    it(`should apply all filter instructions to the data`, async () => {
        await list(undefined, {
            input: {
                filter: [
                    { field: `foo`, op: `GT`, value: 1 },
                    { field: `foo`, op: `LT`, value: 3 }
                ]
            }
        }, context);
        expect(collection.find.mock.calls.length).toBe(1);
        expect(typeof collection.find.mock.calls[0][0]).toBe(`object`);
        expect(Array.isArray(collection.find.mock.calls[0][0].$and)).toBe(true);
        expect(collection.find.mock.calls[0][0].$and.length).toBe(2);
        expect(typeof collection.find.mock.calls[0][0].$and[0]).toBe(`object`);
        expect(typeof collection.find.mock.calls[0][0].$and[0].foo).toBe(`object`);
        expect(collection.find.mock.calls[0][0].$and[0].foo.$gt).toBe(1);

        expect(typeof collection.find.mock.calls[0][0].$and[1].foo).toBe(`object`);
        expect(typeof collection.find.mock.calls[0][0].$and[1].foo).toBe(`object`);
        expect(collection.find.mock.calls[0][0].$and[1].foo.$lt).toBe(3);
    });
    it(`should return hasPreviousPage: false when there is not another record (in the subset resulting from filter, but not first or after) before the first returned record`, async () => {
        const result = await list(undefined, { input: { } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(false);
    });
    it(`should return hasNextPage: false when there is not another record (in the subset resulting from filter, but not last or before) after the last returned record`, async () => {
        const result = await list(undefined, { input: { } }, context);
        expect(result.pageInfo.hasNextPage).toBe(false);
    });
    it(`should return hasPreviousPage: true when there is another record (in the subset resulting from filter, but not first or after) before the first returned record`, async () => {
        let result = await list(undefined, { input: { first: 2, last: 1 } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
        result = await list(undefined, { input: { after: result.edges[0].cursor } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
    });
    it(`should return hasNextPage: true when there is another record (in the subset resulting from filter, but not last or before) after the last returned record`, async () => {
        let result = await list(undefined, { input: { first: 1, last: 2 } }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
        result = await list(undefined, { input: { before: result.edges[0].cursor } }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
    });
});
