describe(`list`, () => {
    let createList, list, data, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createList = require(`../src/list.js`);
        data = require(`./data.js`)();
        list = createList([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof list).toBe(`function`);
    });

    it(`should return a connection structure`, () => {
        const result = list(undefined, { input: { } }, context);
        expect(result && typeof result).toBe(`object`);
        expect(result.pageInfo && typeof result.pageInfo).toBe(`object`);
        expect(typeof result.pageInfo.hasPreviousPage).toBe(`boolean`);
        expect(typeof result.pageInfo.hasNextPage).toBe(`boolean`);
        expect(Array.isArray(result.edges)).toBe(true);
    });
    it(`should return everything when no arguments are specified`, () => {
        const result = list(undefined, { input: { } }, context);
        expect(result.edges.length).toBe(data.length);
        result.edges.forEach((edge, index) => expect(edge.node).toEqual(data[index]));
    });
    it(`should return all elements after the specified "after"`, () => {
        let result = list(undefined, { input: { } }, context);
        result = list(undefined, { input: { after: result.edges[2].cursor } }, context);
        expect(result.edges.length).toBe(1);
        expect(result.edges[0].node.content).toBe(data[3].content);
    });
    it(`should return all elements after the specified "before"`, () => {
        let result = list(undefined, { input: { } }, context);
        result = list(undefined, { input: { before: result.edges[2].cursor } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[1].node.content).toBe(data[1].content);
    });
    it(`should return the no records when first is less than or equal to 0`, () => {
        let result = list(undefined, { input: { first: -11 } }, context);
        expect(result.edges.length).toBe(0);
        result = list(undefined, { input: { first: 0 } }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should return the no records when last is less than or equal to 0`, () => {
        let result = list(undefined, { input: { last: -11 } }, context);
        expect(result.edges.length).toBe(0);
        result = list(undefined, { input: { last: 0 } }, context);
        expect(result.edges.length).toBe(0);
    });
    it(`should return the first n records when first is specified`, () => {
        const result = list(undefined, { input: { first: 2 } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[1].node.content).toBe(data[1].content);
    });
    it(`should return the last n records when last is specified`, () => {
        const result = list(undefined, { input: { last: 2 } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[0].node.content).toBe(data[2].content);
    });
    it(`should return the last m records of the first n records when first and last are specified and first is bigger than last`, () => {
        const result = list(undefined, { input: { first: 3, last: 2 } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[0].node.content).toBe(data[1].content);
    });
    it(`should return the first m records of the last n records when first and last are specified and last is bigger than first`, () => {
        const result = list(undefined, { input: { first: 2, last: 3 } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[0].node.content).toBe(data[1].content);
    });
    it(`should apply all order instructions to data`, () => {
        data.push({ foo: 1, bar: 1, content: `abba` });
        const args = {
            input: {
                order: [
                    { field: `foo`, desc: true },
                    { field: `bar` },
                    { field: `content` }
                ]
            }
        };
        const result = list(undefined, args, context);

        expect(result.edges[0].node.foo).toBe(3);
        expect(result.edges[0].node.bar).toBe(1);
        expect(result.edges[0].node.content).toBe(`spice girls`);

        expect(result.edges[1].node.foo).toBe(2);
        expect(result.edges[1].node.bar).toBe(1);
        expect(result.edges[1].node.content).toBe(`britney spears`);

        expect(result.edges[2].node.foo).toBe(1);
        expect(result.edges[2].node.bar).toBe(1);
        expect(result.edges[2].node.content).toBe(`abba`);

        expect(result.edges[3].node.foo).toBe(1);
        expect(result.edges[3].node.bar).toBe(1);
        expect(result.edges[3].node.content).toBe(`nsync`);

        expect(result.edges[4].node.foo).toBe(1);
        expect(result.edges[4].node.bar).toBe(2);
        expect(result.edges[4].node.content).toBe(`backstreet boys`);


    });
    it(`should apply all filter instructions to the data`, () => {
        const result = list(undefined, {
            input: {
                filter: [
                    { field: `foo`, op: `GT`, value: `1` },
                    { field: `foo`, op: `LT`, value: `3` }
                ]
            }
        }, context);
        expect(result.edges.length).toBe(1);
        expect(result.edges[0].node.foo).toBe(2);
        expect(result.edges[0].node.bar).toBe(1);
    });
    it(`should return hasPreviousPage: false when there is not another record (in the subset resulting from filter, but not first or after) before the first returned record`, () => {
        const result = list(undefined, { input: { } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(false);
    });
    it(`should return hasNextPage: false when there is not another record (in the subset resulting from filter, but not last or before) after the last returned record`, () => {
        const result = list(undefined, { input: { } }, context);
        expect(result.pageInfo.hasNextPage).toBe(false);
    });
    it(`should return hasPreviousPage: true when there is another record (in the subset resulting from filter, but not first or after) before the first returned record`, () => {
        let result = list(undefined, { input: { first: 2, last: 1 } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
        result = list(undefined, { input: { after: result.edges[0].cursor } }, context);
        expect(result.pageInfo.hasPreviousPage).toBe(true);
    });
    it(`should return hasNextPage: true when there is another record (in the subset resulting from filter, but not last or before) after the last returned record`, () => {
        let result = list(undefined, { input: { first: 1, last: 2 } }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
        result = list(undefined, { input: { before: result.edges[0].cursor } }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
    });
});
