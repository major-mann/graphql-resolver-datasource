// This is prepared for the validation in the datasource generator
module.exports = async function integrationTest(test) {
    const lib = require(`../src/index.js`);
    const key = [`entertainerId`];
    const shape = {
        entertainerId: true,
        name: true,
        movies: true,
        nickname: true
    };
    await test(lib(key, shape, []));
};
