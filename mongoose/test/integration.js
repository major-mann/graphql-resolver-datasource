// This is prepared for the validation in the datasource generator
module.exports = async function integrationTest(test) {
    const uuid = require(`uuid`);
    const mongoose = require(`mongoose`);
    // TODO: Want this to be able to be defined from outside the script
    const dbName = uuid.v4().substr(-12);
    const url = `mongodb://localhost:27017/${dbName}`;

    let client;
    try {
        client = await mongoose.createConnection(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
    } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(`Unable to connect mongoose to mongodb server at "${url}". ${ex.message}`);
        return;
    }

    // This is the model defined by the validation generator
    const testSchema = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        entertainerId: {
            type: String,
            required: true
        },
        name: String,
        movies: [String],
        nickname: String
    });
    const TestModel = client.model(`Test`, testSchema);

    const result = require(`../src/index.js`)(
        TestModel,
        createKey,
        autoGenerate
    );
    try {
        await test(result);
    } finally {
        client.db.dropDatabase();
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
