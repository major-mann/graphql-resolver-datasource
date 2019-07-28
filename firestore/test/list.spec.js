describe(`list`, () => {
    let createList, list, context, collection, key, createKey, rawData, data;
    beforeEach(() => {
        context = require(`./context.js`);
        createList = require(`../src/list.js`);
        rawData = [
            { data: () => ({ id: 1, name: `foo` }) },
            { data: () => ({ id: 2, name: `bar` }) },
            { data: () => ({ id: 3, name: `baz` }) }
        ];
        data = {
            forEach: (...args) => rawData.forEach(...args)
        };

        collection = {
            limit: jest.fn(() => collection),
            where: jest.fn(() => collection),
            orderBy: jest.fn(() => collection),
            startAfter: jest.fn(() => collection),
            endBefore: jest.fn(() => collection),
            get: jest.fn(() => data)
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
        result.edges.forEach((edge, index) => expect(edge.node).toEqual(rawData[index].data()));
    });
    it(`should call startAfter when after is specified`, async () => {
        let result = await list(undefined, { input: { } }, context);
        await list(undefined, { input: { after: result.edges[0].cursor } }, context);
        expect(collection.startAfter.mock.calls.length).toBe(1);
        expect(collection.startAfter.mock.calls[0][0]).toBe(key);
    });
    it(`should call endBefore when before is specified`, async () => {
        let result = await list(undefined, { input: { } }, context);
        await list(undefined, { input: { before: result.edges[0].cursor } }, context);
        expect(collection.endBefore.mock.calls.length).toBe(1);
        expect(collection.endBefore.mock.calls[0][0]).toBe(key);
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
        expect(collection.orderBy.mock.calls.length).toBe(3);
        expect(collection.orderBy.mock.calls[0][0]).toBe(`foo`);
        expect(collection.orderBy.mock.calls[0][1]).toBe(`desc`);
        expect(collection.orderBy.mock.calls[1][0]).toBe(`bar`);
        expect(collection.orderBy.mock.calls[2][0]).toBe(`content`);
    });
    it(`should apply all filter instructions to the data`, async () => {
        await list(undefined, {
            input: {
                filter: [
                    { field: `foo`, op: `GT`, value: `1` },
                    { field: `foo`, op: `LT`, value: `3` }
                ]
            }
        }, context);
        expect(collection.where.mock.calls.length).toBe(2);
        expect(collection.where.mock.calls[0][0]).toBe(`foo`);
        expect(collection.where.mock.calls[0][1]).toBe(`>`);
        expect(collection.where.mock.calls[0][2]).toBe(`1`);
        expect(collection.where.mock.calls[1][0]).toBe(`foo`);
        expect(collection.where.mock.calls[1][1]).toBe(`<`);
        expect(collection.where.mock.calls[1][2]).toBe(`3`);
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
