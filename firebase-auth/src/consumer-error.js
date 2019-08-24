module.exports = class ConsumerError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code || `auth/invalid-argument`;
    }
};
