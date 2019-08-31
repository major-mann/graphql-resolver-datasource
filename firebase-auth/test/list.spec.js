describe(`list`, () => {
    let createList, list, context, auth, found, find, listResult;
    beforeEach(() => {
        context = require(`./context.js`);
        createList = require(`../src/user/list.js`);

        found = Symbol(`user`);
        find = jest.fn(() => found);
        listResult = {
            pageToken: undefined,
            users: [
                {
                    uid: 123,
                    email: `userA@example.com`,
                    emailVerified: true,
                    disabled: false
                },
                {
                    uid: 456,
                    email: `userB@example.com`,
                    emailVerified: true,
                    disabled: false
                },
                {
                    uid: 789,
                    email: `userC@example.com`,
                    emailVerified: true,
                    disabled: false
                },
                {
                    uid: 101,
                    email: `userD@example.com`,
                    emailVerified: true,
                    disabled: false
                },
                {
                    uid: 112,
                    email: `userE@example.com`,
                    emailVerified: true,
                    disabled: false
                }
            ]
        };
        auth = {
            listUsers: jest.fn(lim => ({ ...listResult, users: listResult.users.slice(0, lim) })),
            getUserByEmail: jest.fn(),
            getUserByPhoneNumber: jest.fn()
        };
        list = createList(auth, find);
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
    it(`should call list users when no arguments are specified`, async () => {
        await list(undefined, { input: { } }, context);
        expect(auth.listUsers.mock.calls.length).toBe(1);
    });
    it(`should return all elements after the specified "after"`, async () => {
        let result = await list(undefined, { input: { } }, context);
        result = await list(undefined, { input: { after: result.edges[2].cursor } }, context);
        expect(result.edges.length).toBe(2);
        expect(result.edges[0].node.email).toBe(`userD@example.com`);
    });
    it(`should throw an error when "before" is supplied`, async () => {
        let result = await list(undefined, { input: { } }, context);
        try {
            await list(undefined, { input: { before: result.edges[0].cursor } }, context);
        } catch (ex) {
            expect(ex.message).toMatch(/tail/i);
        }
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
    it(`should return the first n records when first is specified`, async () => {
        const result = await list(undefined, { input: { first: 2 } }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[1].node.email).toBe(`userB@example.com`);
    });
    it(`should throw an error when last is specified`, async () => {
        try {
            await list(undefined, { input: { last: 2 } }, context);
        } catch (ex) {
            expect(ex.message).toMatch(/tail/i);
        }
    });
    it(`should return the last m records of the first n records when first and last are specified and first is bigger than last`, async () => {
        const result = await list(undefined, { input: { first: 3, last: 2 } }, context);
        expect(result.edges.length).toBe(2);
        // TODO: Check that the returned node matches the underlying data
        expect(result.edges[0].node.email).toBe(`userB@example.com`);
    });
    it(`should throw an error when first and last are specified and last is bigger than first`, async () => {
        try {
            await list(undefined, { input: { first: 2, last: 3 } }, context);
        } catch (ex) {
            expect(ex.message).toMatch(/tail/i);
        }
    });
    it(`should throw an error when an order argument is specified`, async () => {
        const args = {
            input: {
                order: [
                    { field: `foo`, desc: true },
                    { field: `bar` },
                    { field: `content` }
                ]
            }
        };
        try {
            await list(undefined, args, context);
        } catch (ex) {
            expect(ex.message).toMatch(/support/i);
        }
    });
    it(`should throw an error when filter arguments are supplied`, async () => {
        const args = {
            input: {
                filter: [
                    { field: `foo`, op: `GT`, value: `1` },
                    { field: `foo`, op: `LT`, value: `3` }
                ]
            }
        };
        try {
            await list(undefined, args, context);
        } catch (ex) {
            expect(ex.message).toMatch(/support/i);
        }
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
        listResult.pageToken = true;
        let result = await list(undefined, { input: { first: 2 } }, context);
        expect(result.pageInfo.hasNextPage).toBe(true);
    });
});
