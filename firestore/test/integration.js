// This is prepared for the validation in the datasource generator
module.exports = function integrationTest() {
    const Firestore = require(`@google-cloud/firestore`);
    const store = new Firestore(); // Note we are relying on the env var
    /*
    The tests will be working against the following schema
        entertainerId: String // This is the key field
        name: String
        movies: [String]
        nickname: String
    */
    return require(`../src/index.js`)(store.collection(`tests`), createKey, autoGenerate);

    function createKey(node) {
        if (node.entertainerId === undefined) {
            throw new Error(`Supplied node does not contain the key field "entertainerId"`);
        }
        return node.entertainerId;
    }

    function autoGenerate(node) {
        node.entertainerId = node.entertainerId || Math.random().toString(36).substr(2);
    }
};
