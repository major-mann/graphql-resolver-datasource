describe(`src/token/create-token.spec.js`, () => {
    const createCreateToken = require(`../../../src/token/create-token.js`);
    let rest, createToken, tokenData;
    beforeEach(() => {
        tokenData = { };
        rest = {
            verifyCustomToken: jest.fn(() => tokenData)
        };
        createToken = createCreateToken({ }, rest);
    });
    it(`should be a function`, () => {
        expect(typeof createToken).toBe(`function`);
    });
    it(`should return the token data`, async () => {
        const result = await createToken(undefined, {
            input: { }
        });
        expect(result).toBe(tokenData);

        tokenData = undefined;
        const result2 = await createToken(undefined, {
            input: { }
        });
        expect(result2).toBe(undefined);
    });
});
