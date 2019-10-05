// This is prepared for the validation in the datasource generator
module.exports = async function integrationTest(test) {
    const uuid = require(`uuid`);
    const { MongoClient } = require(`mongodb`);
    // TODO: Want this to be able to be defined from outside the script
    const url = `mongodb://localhost:27017`;
    const dbName = uuid.v4().substr(-12);

    let client;
    try {
        client = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(`Unable to connect to mongodb server at "${url}". ${ex.message}`);
        return;
    }

    const store = client.db(dbName);
    const result = require(`../src/index.js`)(
        store.collection(`tests`),
        createKey,
        autoGenerate
    );
    try {
        await test(result);
    } finally {
        store.dropDatabase();
        client.close();
    }

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
