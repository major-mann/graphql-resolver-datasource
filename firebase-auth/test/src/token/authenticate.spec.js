describe(`src/token/authenticate.spec.js`, () => {
    const createAuthenticate = require(`../../../src/token/authenticate.js`);
    let rest, authenticate, tokenData;
    beforeEach(() => {
        tokenData = {
            localId: `uid`
        };
        rest = {
            verifyPassword: jest.fn(() => tokenData)
        };
        authenticate = createAuthenticate(rest);
    });
    it(`should be a function`, () => {
        expect(typeof authenticate).toBe(`function`);
    });
    it(`should ensure input.email and input.password are supplied`, async () => {
        await expect(authenticate(undefined, { input: { password: `password` } }))
            .rejects
            .toThrow(/email/);
        await expect(authenticate(undefined, { input: { email: `email` } }))
            .rejects
            .toThrow(/password/);
    });
    it(`should return the token data`, async () => {
        const result = await authenticate(undefined, {
            input: {
                email: `email`,
                password: `password`
            }
        });
        expect(result).toBe(tokenData);

        tokenData = undefined;
        const result2 = await authenticate(undefined, {
            input: {
                email: `email`,
                password: `password`
            }
        });
        expect(result2).toBe(undefined);
    });
    it(`should rename "localId" to "uid"`, async () => {
        const result = await authenticate(undefined, {
            input: {
                email: `email`,
                password: `password`
            }
        });
        expect(result.uid).toBe(`uid`);
    });
});
