describe(`update`, () => {
    let createUpdate, update, data, context;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        createUpdate = require(`../src/update.js`);
        data = require(`./data.js`)();
        update = createUpdate([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof update).toBe(`function`);
    });
    it(`should throw an error if no record to update can be found`, () => {
        expect(() => update(undefined, { input: { foo: 10, bar: 10, content: `test` } }, context)).toThrow(/find.*document/i);
    });
    it(`should update any fields supplied in the store`, () => {
        update(undefined, { input: { foo: 1, bar: 1, content: `westlife` } }, context);
        expect(data[0].content).toBe(`westlife`);
    });
    it(`should not update any fields missing from the input`, () => {
        update(undefined, { input: { foo: 2, bar: 1, content: `foo bar` } }, context);
        expect(data[2].content).toBe(`foo bar`);
        expect(data[2].aka).toBe(`princess of pop`);
    });
    it(`should only store data that is defined on the shape`, () => {
        const shape = { foo: true, bar: true, content: true };
        update = createUpdate([`foo`, `bar`], shape, data);
        update(undefined, { input: { foo: 1, bar: 1, content: `test`, sub: `test` } }, context);
        expect(data[0].content).toBe(`test`);
        expect(data[0].sub).toBe(undefined);
    });
});