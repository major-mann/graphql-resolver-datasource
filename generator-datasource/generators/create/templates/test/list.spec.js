describe(`list`, () => {
    let createList, list, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createList = require(`../src/list.js`);
        list = createList();
    });

    it(`should be a function`, () => {
        expect(typeof list).toBe(`function`);
    });

    it(`should return a connection structure`, async () => {
        const result = await list(undefined, { }, context);
        expect(result && typeof result).toBe(`object`);
        expect(result.pageInfo && typeof result.pageInfo).toBe(`object`);
        expect(typeof result.pageInfo.hasPreviousPage).toBe(`boolean`);
        expect(typeof result.pageInfo.hasNextPage).toBe(`boolean`);
        expect(Array.isArray(result.edges)).toBe(true);
    });
    it(`should return everything when no arguments are specified`, async () => {
        const result = await list(undefined, { }, context);

        // TODO: Check that all records were returned (the tests should only have record counts under default limits)
        expect(result.edges.length).toBe(-1);
        // TODO: Check that every returned node matches the underlying data
        result.edges.forEach(edge => expect(edge.node).toEqual(Symbol(`not defined`)));
    });
    it(`should return all elements after the specified "after"`, async () => {
        let result = await list(undefined, { }, context);
        result = await list(undefined, { after: result.edges[2].cursor }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[0].node.content).toBe(Symbol(`not defined`));
    });
    it(`should return all elements after the specified "before"`, async () => {
        let result = await list(undefined, { }, context);
        result = await list(undefined, { before: result.edges[2].cursor }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[1].node.content).toBe(Symbol(`not defined`));
    });
    it(`should return the no records when first is less than or equal to 0`, async () => {
        let result = await list(undefined, { first: -11 }, context);
        expect(result.edges.length).toBe(0);
        result = await list(undefined, { first: 0 }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should return the no records when last is less than or equal to 0`, async () => {
        let result = await list(undefined, { last: -11 }, context);
        expect(result.edges.length).toBe(0);
        result = await list(undefined, { last: 0 }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should return the first n records when first is specified`, async () => {
        const result = await list(undefined, { first: 2 }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[1].node.content).toBe(Symbol(`not defined`));
    });
    it(`should return the last n records when last is specified`, async () => {
        const result = await list(undefined, { last: 2 }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[0].node.content).toBe(Symbol(`not defined`));
    });
    it(`should return the last m records of the first n records when first and last are specified and first is bigger than last`, async () => {
        const result = await list(undefined, { first: 3, last: 2 }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[0].node.content).toBe(Symbol(`not defined`));
    });
    it(`should return the first m records of the last n records when first and last are specified and last is bigger than first`, async () => {
        const result = await list(undefined, { first: 2, last: 3 }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[0].node.content).toBe(Symbol(`not defined`));
    });
    it(`should apply all order instructions to data`, async () => {
        const args = {
            order: [
                { field: `foo`, desc: true },
                { field: `bar` },
                { field: `content` }
            ]
        };
        const result = await list(undefined, args, context);

        // TODO: Check that the returned data is in the correct order
        expect(false).toBe(true);
    });
    it(`should apply all filter instructions to the data`, async () => {
        const result = await list(undefined, {
            filter: [
                { field: `foo`, op: `GT`, value: `1` },
                { field: `foo`, op: `LT`, value: `3` }
            ]
        }, context);

        // TODO: Check that only the expected data is returned
        expect(false).toBe(true);
    });
    it(`should return hasPreviousPage: false when there is not another record (in the subset resulting from filter, but not first or after) before the first returned record`, async () => {
        const result = await list(undefined, { }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(false);
    });
    it(`should return hasNextPage: false when there is not another record (in the subset resulting from filter, but not last or before) after the last returned record`, async () => {
        const result = await list(undefined, { }, context);
        expect(result.pageInfo.hasNextPage).toBe(false);
    });
    it(`should return hasPreviousPage: true when there is another record (in the subset resulting from filter, but not first or after) before the first returned record`, async () => {
        let result = await list(undefined, { first: 2, last: 1 }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
        result = await list(undefined, { after: result.edges[0].cursor }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
    });
    it(`should return hasNextPage: true when there is another record (in the subset resulting from filter, but not last or before) after the last returned record`, async () => {
        let result = await list(undefined, { first: 1, last: 2 }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
        result = await list(undefined, { before: result.edges[0].cursor }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
    });
});
