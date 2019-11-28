describe(`src/token/revoke-token.spec.js`, () => {
    const createRevokeToken = require(`../../../src/token/revoke-token.js`);
    let auth, revokeToken;
    beforeEach(() => {
        auth = {
            revokeRefreshTokens: jest.fn()
        };
        revokeToken = createRevokeToken(() => auth);
    });
    it(`should be a function`, () => {
        expect(typeof revokeToken).toBe(`function`);
    });
    it(`should pass the uid to auth`, async () => {
        await revokeToken(undefined, {
            input: {
                uid: `fake-uid`
            }
        });
        expect(auth.revokeRefreshTokens.mock.calls.length).toBe(1);
        expect(auth.revokeRefreshTokens.mock.calls[0][0]).toBe(`fake-uid`);
    });
});
