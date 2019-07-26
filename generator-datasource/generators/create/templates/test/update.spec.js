describe(`update`, () => {
    let createUpdate, update, context;
    beforeEach(() => {
        context = require(`./context.js`);
        createUpdate = require(`../src/update.js`);
        update = createUpdate();
    });

    it(`should be a function`, () => {
        expect(typeof update).toBe(`function`);
    });
    it(`should throw an error if no record to update can be found`, async () => {
        await expect(update(undefined, { input: { foo: 10, bar: 10, content: 'test' } }, context)).rejects.toMatch(/find.*document/i);
    });
    it(`should update any fields supplied in the store`, async () => {
        await update(undefined, { input: { foo: 1, bar: 1, content: `westlife` } }, context);

        // TODO: Check that the correct data has been updated
        expect(false).toBe(true);
    });
    it(`should not update any fields missing from the input`, async () => {
        await update(undefined, { input: { foo: 2, bar: 1, content: `foo bar` } }, context);

        // TODO: Check that the correct data has been updated, and that additional data is still in tact
        expect(false).toBe(true);
    });
    it(`should only store data that is defined on the shape`, async () => {
        const shape = { foo: true, bar: true, content: true };
        update = createUpdate([`foo`, `bar`], shape, data);
        await update(undefined, { input: { foo: 1, bar: 1, content: `test`, sub: `test` } }, context);

        // TODO: Check that the correct data has been updated, and that additional data is not stored
        expect(false).toBe(true);
    });
});