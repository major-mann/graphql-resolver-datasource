module.exports = createEmailVerificationValidator;

// TODO: From configuration
const EMAIL = `calvin+validate-email-verification@ancible.io`;

const assert = require(`assert`);
const { URL } = require(`url`);
const uuid = require(`uuid`);

async function createEmailVerificationValidator(resolvers, source, context, info, tenantId) {
    // TODO: Improve assertion error messages
    const password = uuid.v4();
    const cleanup = [];
    let result;
    try {
        const document1 = await resolvers.create(source, {
            input: {
                email: EMAIL,
                password,
                tenantId
            }
        }, context, info);
        cleanup.push(document1.uid);

        assert(document1, `Expected the created document to be returned`);
        assert.equal(document1.email, EMAIL);

        const link = await resolvers.generateEmailVerification(
            source,
            { input: document1 },
            context,
            info
        );
        const linkCode = extractLinkOobCode(link);
        assert(linkCode, `Unable to extract OOB code from generated link "${link}"`);

        await resolvers.confirmEmailVerification(
            source,
            { input: { tenantId, code: linkCode } },
            context,
            info
        );
        result = true;
    } catch (ex) {
        console.error(`Email verification validation failed. ${ex.stack}`); // eslint-disable-line no-console
        result = false;
    }
    await Promise.all(
        cleanup.map(
            uid => resolvers.delete(source, { input: { tenantId, uid } }, context, info)
        )
    );
    return result;
}

function extractLinkOobCode(link) {
    const uri = new URL(link);
    return uri.searchParams.get(`oobCode`);
}
