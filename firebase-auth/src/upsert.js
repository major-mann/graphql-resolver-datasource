module.exports = createUpsertHandler;

const SALT_ROUNDS = 8;

const bcrypt = require(`bcrypt`);


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
        await ensurePasswordHash(input);

        const options = input.passwordHash && {
            hash: {
                algorithm: input.passwordHash.algorithm
            }
        };
        input.passwordHash = input.passwordHash && Buffer.from(input.passwordHash.hash, `base64`);

        if (input.claims) {
            input.customClaims = input.claims;
            delete input.claims;
        }

        const importResult = await auth.importUsers([input], options);
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
    }

    async function ensurePasswordHash(input) {
        if (!input.passwordHash && input.password) {
            input.passwordHash = {
                algorithm: `BCRYPT`,
                hash: await bcrypt.hash(input.password, SALT_ROUNDS)
            };
        }
    }
}
