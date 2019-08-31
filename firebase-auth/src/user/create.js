module.exports = createCreateHandler;

const UID_SIZE = 28;

const crypto = require(`crypto`);
const ConsumerError = require(`../consumer-error.js`);

function createCreateHandler(auth, find, upsert) {
    return create;

    /**
     * Creates a new record in the data source. This record will be sanitized according to the shape
     * @param {*} source Unused
     * @param {object} args The arguments to create the entity with.
     * @param {object} args.input The document to create
     */
    async function create(source, args, context, info) {
        const shouldUpsert = !args.input.password && args.input.passwordHash;

        if (!shouldUpsert) {
            const user = await auth.createUser(args.input);
            if (args.input.customClaims) {
                await auth.setCustomUserClaims(user.uid, args.input.customClaims);
            }
            return user;
        }

        args = { ...args, input: { ...args.input } };
        if (args.input.uid) {
            const existing = await find(source, args, context, info);
            if (existing) {
                throw new ConsumerError(
                    `user with uid "${args.input.uid}" already exists`,
                    `auth/uid-already-exists`
                );
            }
        } else {
            args.input.uid = await generateUid();
        }

        // TODO: Normalize any errors coming out of upsert to be the same as create
        const result = await upsert(source, args, context, info);
        return result;
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