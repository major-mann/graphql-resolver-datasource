describe(`upsert`, () => {
    let createUpsert, upsert, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpsert = require(`../src/user/upsert.js`);
        upsert = createUpsert();
    });

    it(`should be a function`, () => {
        expect(typeof upsert).toBe(`function`);
    });
    it(`should throw an error`, async () => {
        let succeeded = false;
        try {
            await upsert(undefined, { input: { foo: 1 } }, context);
            succeeded = true;
        } catch (ex) {
            // Do nothing
        }
        expect(succeeded).toBe(false);
    });
});