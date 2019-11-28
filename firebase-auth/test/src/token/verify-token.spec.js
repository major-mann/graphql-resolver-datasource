describe(`src/token/verify-token.spec.js`, () => {
    const createVerifyToken = require(`../../../src/token/verify-token.js`);
    let auth, verifyToken, claims;
    beforeEach(() => {
        claims = {};
        auth = {
            verifyIdToken: jest.fn(() => claims)
        };
        verifyToken = createVerifyToken(() => auth);
    });
    it(`should be a function`, () => {
        expect(typeof verifyToken).toBe(`function`);
    });
    it(`should ensure idToken is supplied`, async () => {
        await expect(verifyToken(undefined, { input: { } }))
            .rejects
            .toThrow(/token/);
    });
    it(`should return the claims`, async () => {
        const result = await verifyToken(undefined, { input: { idToken: `fake-token` } });
        expect(result).toBe(claims);
    });
});
