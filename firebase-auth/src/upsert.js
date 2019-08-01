module.exports = createUpsertHandler;

function createUpsertHandler() {
    return upsert;

    /**
     * Upsert is not supported by firebase auth
     * @throws Always - Not supported
     */
    async function upsert() {
        throw new Error(`upsert is not supported by firebase auth (as a symptom ` +
            `of not being able to create users with custom uids)`);
    }
}
