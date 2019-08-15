module.exports = function createImportUsersHandler(auth) {
    return importUsers;

    /**
     * Imports users
     * @param {*} source Unused
     * @param {object} args The arguments
     * @param {object} args.input
     * @param {array} args.input.users The users to input
     * @param {string} args.input.users[].uid The user id
     * @param {boolean} args.input.users[].disabled Whether the user is disabled or not
     * @param {string} args.input.users[].email The user's email
     * @param {boolean} args.input.users[].emailVerified Whether the user's email is verified
     * @param {string} args.input.users[].passwordHash The password hash
     * @param {string} args.input.users[].passwordSalt The password salt
     * @param {object} args.input.options The import options
     * @param {object} args.input.options.hash The password hash options
     * @param {string} args.input.options.hash.algorithm The password hashing algorithm identifier.
     *                                                   The following algorithm identifiers are
     *                                                   supported: SCRYPT, STANDARD_SCRYPT, HMAC_SHA512,
     *                                                   HMAC_SHA256, HMAC_SHA1, HMAC_MD5, MD5, PBKDF_SHA1,
     *                                                   BCRYPT, PBKDF2_SHA256, SHA512, SHA256 and SHA1
     * @param {number} args.input.options.hash.blockSize The hash algorithm block size
     * @param {number} args.input.options.hash.derivedKeyLength The derived key length of the hashing algorithm
     * @param {Buffer} args.input.options.hash.key The signing key
     * @param {number} args.input.options.hash.memoryCost The memory cost (Used for SCRYPT)
     * @param {number} args.input.options.hash.parallelization The parallelization of the hashing algorithm
     * @param {number} args.input.options.hash.rounds The number of rounds
     * @param {Buffer} args.input.options.hash.saltSeparator The salt separator
     *
     */
    async function importUsers(source, args) {
        if (args.input.users.length === 0) {
            return;
        }
        const result = await auth.importUsers(
            args.input.users,
            args.input.options
        );
        return result;
    }
};
