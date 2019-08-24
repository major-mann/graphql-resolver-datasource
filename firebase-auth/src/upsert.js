module.exports = createUpsertHandler;

const SALT_ROUNDS = 8;

const bcrypt = require(`bcrypt`);
const ConsumerError = require(`./consumer-error.js`);

function createUpsertHandler(auth, find) {
    return upsert;

    /**
     * Creates or updates a user.
     * @param {*} source Unused
     * @param {object} args The arguments to use to create or update the user
     * @param {object} args.input The user information
     */
    async function upsert(source, args, context, info) {
        const input = { ...args.input };

        // This will convert "password" to a BCRYPT "passwordHash"
        await ensurePasswordHash(input);
        const hashImportOptions = buildImportOptions(input.passwordHash);
        input.passwordHash = input.passwordHash && Buffer.from(input.passwordHash.hash, `base64`);

        // Import allows duplicates to go through for effeciency purposes.
        //  We aren't using it in that manner, and it would deviate from
        //  the expected behaviour (If we get to feature completeness the
        //  import function should be exposed allowing the functionality
        //  through an alternate vector
        await ensureUniqueEmailPhone();

        const importResult = await auth.importUsers([input], hashImportOptions);
        if (importResult.errors.length) {
            throw importResult.errors[0].error;
        }
        const result = await find(
            source,
            { input },
            context,
            info
        );
        return result;

        async function ensureUniqueEmailPhone() {
            const [existingEmail, existingPhone] = await Promise.all([
                emailSearch(input.email),
                input.phoneNumber && phoneSearch(input.phoneNumber)
            ]);

            if (existingEmail && existingEmail.uid !== input.uid) {
                throw new ConsumerError(
                    `The supplied email "${input.email}" is already in use`,
                    `auth/email-already-exists`
                );
            }
            if (existingPhone && existingPhone.uid !== input.uid) {
                throw new ConsumerError(
                    `The supplied phoneNumber "${input.phoneNumber}" is already in use`,
                    `auth/phone-number-already-exists`
                );
            }
        }

        async function emailSearch(email) {
            try {
                const user = await auth.getUserByEmail(email);
                return user;
            } catch (ex) {
                if (ex.code === `auth/user-not-found`) {
                    return undefined;
                } else {
                    throw ex;
                }
            }
        }

        async function phoneSearch(phoneNumber) {
            try {
                const user = await auth.getUserByPhoneNumber(phoneNumber);
                return user;
            } catch (ex) {
                if (ex.code === `auth/user-not-found`) {
                    return undefined;
                } else {
                    throw ex;
                }
            }
        }
    }

    async function ensurePasswordHash(input) {
        if (!input.passwordHash && input.password) {
            input.passwordHash = {
                algorithm: `BCRYPT`,
                hash: await bcrypt.hash(input.password, SALT_ROUNDS)
            };
        }
    }

    function buildImportOptions(passwordHash) {
        return passwordHash && {
            hash: {
                algorithm: passwordHash.algorithm
            }
        };
    }
}
