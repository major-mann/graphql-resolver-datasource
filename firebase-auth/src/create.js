module.exports = createCreateHandler;

const UID_SIZE = 28;
const SALT_ROUNDS = 8;

const crypto = require(`crypto`);
const bcrypt = require(`bcrypt`);

function createCreateHandler(auth, find) {
    return create;

    /**
     * Creates a new record in the data source. This record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     * @throws When args.input is not an object
     */
    async function create(source, args, context, info) {
        if (!args.input || typeof args.input !== `object`) {
            throw new Error(`No input value supplied in args`);
        }
        const shouldImport = args.input.uid ||
            (!args.input.password && args.input.passwordHash);

        if (!shouldImport) {
            const user = await auth.createUser(args.input);
            return user;
        }
        const input = { ...args.input };
        await Promise.all([
            ensureUid(input),
            ensurePasswordHash(input)
        ]);

        const options = input.passwordHash && {
            hash: {
                algorithm: input.passwordHash.algorithm
            }
        };
        input.passwordHash = input.passwordHash &&
            Buffer.from(input.passwordHash.hash, `base64`);
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

    async function ensureUid(input) {
        if (!input.uid) {
            input.uid = await generateUid();
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

    function generateUid() {
        return new Promise(function promiseHandler(resolve, reject) {
            crypto.randomBytes(UID_SIZE, function onGenerated(err, buffer) {
                if (err) {
                    reject(err);
                } else {
                    const uid = buffer.toString(`base64`);
                    resolve(uid);
                }
            });
        });
    }
}
