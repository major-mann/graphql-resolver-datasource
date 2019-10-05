describe(`index`, () => {
    let createDatasource, dataSource;
    beforeEach(() => {
        createDatasource = require(`../src/index.js`);
        dataSource = createDatasource([`foo`, `bar`], undefined, []);
    });

    it(`should be return an object`, () => {
        expect(dataSource && typeof dataSource).toBe(`object`);
    });
    it(`should have a find function`, () => {
        expect(typeof dataSource.find).toBe(`function`);
    });
    it(`should have a find function`, () => {
        expect(typeof dataSource.find).toBe(`function`);
    });
    it(`should have a list function`, () => {
        expect(typeof dataSource.list).toBe(`function`);
    });
    it(`should have a create function`, () => {
        expect(typeof dataSource.create).toBe(`function`);
    });
    it(`should have a upsert function`, () => {
        expect(typeof dataSource.upsert).toBe(`function`);
    });
    it(`should have a update function`, () => {
        expect(typeof dataSource.update).toBe(`function`);
    });
    it(`should have a delete function`, () => {
        expect(typeof dataSource.delete).toBe(`function`);
    });
});