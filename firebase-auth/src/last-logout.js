// checkRevoked

module.exports = function createLastLogoutHandler(auth) {
    return checkLastRevoked;

    /**
     * Checks whether the last token revocation (logout) was after the specified time
     * @param {*} source Unused
     * @param {object} args The arguments to check with
     * @param {object} args.input The user uid
     */
    async function checkLastRevoked(source, args) {
        const user = await auth.getUser(args.input);
        if (user) {
            return Date.parse(user && user.tokensValidAfterTime) || 0;
        } else {
            return undefined;
        }
    }
};
