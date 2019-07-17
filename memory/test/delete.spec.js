describe(`delete`, () => {
    let remove, context, data;
    beforeEach(() => {
        context = require(`./context.js`);
        jest.mock(`../src/list.js`);
        const createDelete = require(`../src/delete.js`);
        data = require(`./data.js`)();
        remove = createDelete([`foo`, `bar`], undefined, data);
    });

    it(`should be a function`, () => {
        expect(typeof remove).toBe(`function`);
    });
    it(`should remove the item with the specified key`, () => {
        remove(undefined, { input: { foo: 1, bar: 2 } }, context);
        expect(data.length).toBe(3);
        expect(data[0].foo).toBe(1);
        expect(data[1].foo).toBe(2);
    });
    it(`should ignore any fields that are not part of the key`, () => {
        remove(undefined, { input: { foo: 1, bar: 2, content: `doesn't matter` } }, context);
        expect(data.length).toBe(3);
        expect(data[0].foo).toBe(1);
        expect(data[1].foo).toBe(2);
    });
    it(`should return removed record`, function () {
        const original = data[1];
        const result = remove(undefined, { input: { foo: 1, bar: 2 } }, context);
        expect(result).toEqual(original);
    });
});