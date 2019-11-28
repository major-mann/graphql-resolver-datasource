describe(`src/token/refresh-id-token.spec.js`, () => {
    const createRefreshIdToken = require(`../../../src/token/refresh-id-token.js`);
    let rest, refreshToken, tokenData;
    beforeEach(() => {
        tokenData = {
            user_id: `user_id`,
            id_token: `id_token`,
            refresh_token: `refresh_token`,
            expires_in: `12345`,
            token_type: `token_type`,
            project_id: `project_id`
        };
        rest = {
            refreshIdToken: jest.fn(() => tokenData)
        };
        refreshToken = createRefreshIdToken(rest);
    });
    it(`should be a function`, () => {
        expect(typeof refreshToken).toBe(`function`);
    });
    it(`should return the token information`, async () => {
        const result = await refreshToken(undefined, {
            input: { }
        });
        expect(result).toEqual({
            uid: `user_id`,
            idToken: `id_token`,
            refreshToken: `refresh_token`,
            expiresIn: 12345,
            tokenType: `token_type`,
            projectId: `project_id`
        });
    });
});
