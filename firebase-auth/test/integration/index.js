module.exports = validate;

const { readFile } = require(`fs`);
const { promisify } = require(`util`);
const firebase = require(`firebase-admin`);
const chalk = require(`chalk`);
const minimist = require(`minimist`);

const createResolvers = require(`../../src/index.js`);
const validateDelete = require(`./validate-delete.js`);
const validateCreate = require(`./validate-create.js`);
const validateUpdate = require(`./validate-update.js`);
const validateFind = require(`./validate-find.js`);
const validateList = require(`./validate-list.js`);
const validateEmailVerification = require(`./email/validate-email-verification.js`);
const validatePasswordReset = require(`./email/validate-password-reset.js`);
const validateAuthenticate = require(`./token/validate-authenticate.js`);
const validateCreateToken = require(`./token/validate-create-token.js`);
const validateRefreshToken = require(`./token/validate-refresh-id-token.js`);
const validateRevokeToken = require(`./token/validate-revoke-token.js`);
const validateVerifyToken = require(`./token/validate-verify-token.js`);

if (!module.parent) {
    runScript();
}

async function runScript() {
    // TODO: Easy way to run against local firebase instance?
    //  We certainly couldn't do the rest integrations....
    const argv = minimist(process.argv.slice(2));
    if (argv.help) {
        // eslint-disable-next-line no-console
        console.error(`node index.js [--service-account=<service account file>] [--tenant=<tenant id>])`);
        return;
    }

    argv.serviceAccount = argv.serviceAccount || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!argv.serviceAccount) {
        // eslint-disable-next-line no-console
        console.error(`Either a service account must be supplied (--service-account) or ` +
            `GOOGLE_APPLICATION_CREDENTIALS in the environment`);
        // eslint-disable-next-line no-console
        console.error(`node index.js [--service-account=<service account file>] [--tenant=<tenant id>])`);
        return;
    }

    const serviceAccount = await loadJson(argv.serviceAccount);

    let tenantId;
    if (argv.tenant === undefined || argv.tenant === `yes`) {
        tenantId = true;
    } else if (argv.tenant === `no`) {
        tenantId = undefined;
    } else {
        tenantId = argv.tenant;
    }
    validate(serviceAccount, tenantId);
}

async function validate(serviceAccount, tenantId) {
    let app, tenantManager;
    if (tenantId === true) {
        app = firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount)
        });
        tenantManager = app.auth().tenantManager();
        const tenant  = await tenantManager.createTenant({ displayName: `integration-test` });
        tenantId = tenant.tenantId;
        tenantManager.updateTenant(tenantId, {
            emailSignInConfig: {
                enabled: true,
                passwordRequired: true
            }
        });
    }

    const resolvers = await createResolvers(serviceAccount);
    const source = {};
    const info = {};
    const context = {
        stat: {
            increment: () => undefined,
            decrement: () => undefined,
            timing: () => undefined,
            update: () => undefined,
            gauge: () => undefined
        }
    };

    try {
        console.log(chalk.yellow(`Validating deletion functionality`)); // eslint-disable-line no-console
        if (await validateDelete(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Deletion functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Deletion functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating creation functionality`)); // eslint-disable-line no-console
        if (await validateCreate(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Creation functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Creation functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating update functionality`)); // eslint-disable-line no-console
        if (await validateUpdate(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Update functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Update functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating find functionality`)); // eslint-disable-line no-console
        if (await validateFind(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Find functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Find functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating list functionality`)); // eslint-disable-line no-console
        if (await validateList(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`List functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`List functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }
        console.log(chalk.yellow(`Validating authentication functionality`)); // eslint-disable-line no-console
        if (await validateAuthenticate(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Authentication functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Authentication functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating token creation functionality`)); // eslint-disable-line no-console
        if (await validateCreateToken(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Token creation functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Token creation functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating email verification functionality`)); // eslint-disable-line no-console
        if (await validateEmailVerification(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Email verification functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Email verification functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating password reset functionality`)); // eslint-disable-line no-console
        if (await validatePasswordReset(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Password reset functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Password reset functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating refresh id token functionality`)); // eslint-disable-line no-console
        if (await validateRefreshToken(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Refresh id token functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Refresh id token functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating revoke token functionality`)); // eslint-disable-line no-console
        if (await validateRevokeToken(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Revoke token functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Revoke token functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating verify token functionality`)); // eslint-disable-line no-console
        if (await validateVerifyToken(resolvers, source, context, info, tenantId)) {
            console.log(chalk.green(`Verify token functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Verify token functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.bold.green(`✓ All tests passed ✓`)); // eslint-disable-line no-console
    } finally {
        try {
            if (tenantManager) {
                await tenantManager.deleteTenant(tenantId);
            }
        } finally {
            if (app) {
                app.delete();
            }
            resolvers.dispose();
        }
    }
}

async function loadJson(path) {
    const serviceAccountText = await promisify(readFile)(path, { encoding: `utf8` });
    const json = JSON.parse(serviceAccountText);
    return json;
}
