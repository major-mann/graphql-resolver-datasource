// This is prepared for the validation in the datasource generator
module.exports = function integrationTest() {
    /*
    The tests will be working against the following schema
        entertainerId: String // This is the key field
        name: String
        movies: [String]
        nickname: String
    */
    return require(`../src/index.js`)(/* Initialization args here */);
};
