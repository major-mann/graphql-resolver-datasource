// This is prepared for the validation in the datasource generator
module.exports = function integrationTest() {
    const lib = require(`../src/index.js`);
    const key = [`entertainerId`];
    const shape = {
        entertainerId: true,
        name: true,
        movies: true,
        nickname: true
    };
    return lib(key, shape, []);
};
