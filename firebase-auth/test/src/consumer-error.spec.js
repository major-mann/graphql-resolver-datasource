describe(`src/consumer-error.js`, () => {
    let ConsumerError;
    beforeEach(() => {
        ConsumerError = require(`../../src/consumer-error.js`);
    });

    it(`should be a function`, () => {
        expect(typeof ConsumerError).toBe(`function`);
    });

    it(`should construct an Error`, () => {
        const result = new ConsumerError();
        expect(result instanceof Error).toBe(true);
    });

    it(`should assign the message`, () => {
        const message = Math.random().toString(36).substr(2);
        const result = new ConsumerError(message);
        expect(result.message).toBe(message);
    });

    it(`should assign the code`, () => {
        const code = Math.random().toString(36).substr(2);
        const result = new ConsumerError(`A test error message`, code);
        expect(result.code).toBe(code);
    });
});
