module.exports = createPasswordResetValidator;

// TODO: From configuration
const EMAIL = `calvin+validate-email-verification@ancible.io`;

const assert = require(`assert`);
const { URL } = require(`url`);
const uuid = require(`uuid`);

async function createPasswordResetValidator(resolvers, source, context, info) {
    // TODO: Improve assertion error messages
    const password = uuid.v4();
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                email: EMAIL,
                password
            }
        }, context, info);
        cleanup.push(document1.uid);

        assert(document1, `Expected the created document to be returned`);
        assert.equal(document1.email, EMAIL);

        const link = await resolvers.generatePasswordReset(
            source,
            { input: document1 },
            context,
            info
        );
        const linkCode = extractLinkOobCode(link);
        assert(linkCode, `Unable to extract OOB code from generated link "${link}"`);

        // TODO: Verify first!

        const password2 = uuid.v4();
        await resolvers.confirmPasswordReset(
            source,
            {
                input: {
                    code: linkCode,
                    password: password2
                }
            },
            context,
            info
        );

        await resolvers.authenticate(
            source,
            {
                input: {
                    email: document1.email, password: password2
                }
            },
            context,
            info
        );
        result = true;
    } catch (ex) {
        console.error(`Password reset validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { uid } }, context, info)
        )
    );
    return result;
}

function extractLinkOobCode(link) {
    const uri = new URL(link);
    return uri.searchParams.get(`oobCode`);
}
