module.exports = function createLinkHandlers(loadAuth, rest) {
    return {
        generateSignIn,
        sendPasswordReset,
        verifyPasswordReset,
        confirmPasswordReset,
        generatePasswordReset,
        sendEmailVerification,
        confirmEmailVerification,
        generateEmailVerification
    };

    async function generateSignIn(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        const link = await auth.generateSignInWithEmailLink(
            args.input.email
        );
        return link;
    }

    async function generatePasswordReset(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        const link = await auth.generatePasswordResetLink(
            args.input.email
        );
        return link;
    }

    async function generateEmailVerification(source, args) {
        const auth = await loadAuth(args.input.tenantId);
        const link = await auth.generateEmailVerificationLink(
            args.input.email
        );
        return link;
    }

    function sendPasswordReset(source, args) {
        return rest.sendPasswordReset(
            args.input.tenantId,
            args.input.email,
            args.input.locale
        );
    }

    async function verifyPasswordReset(source, args) {
        return rest.verifyPasswordResetCode(
            args.input.tenantId,
            args.input.code
        );
    }

    async function confirmPasswordReset(source, args) {
        return rest.confirmPasswordReset(
            args.input.tenantId,
            args.input.code,
            args.input.password
        );
    }

    async function sendEmailVerification(source, args) {
        return rest.sendEmailVerification(
            args.input.tenantId,
            args.input.token,
            args.input.locale
        );
    }

    function confirmEmailVerification(source, args) {
        return rest.confirmEmailVerification(
            args.input.tenantId,
            args.input.code
        );
    }
};
