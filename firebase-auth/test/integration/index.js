module.exports = validate;

const firebase = require(`firebase-admin`);
const chalk = require(`chalk`);

const validateDelete = require(`./validate-delete.js`);
const validateCreate = require(`./validate-create.js`);
const validateUpdate = require(`./validate-update.js`);
const validateFind = require(`./validate-find.js`);
const validateList = require(`./validate-list.js`);
const validateEmailVerification = require(`./email/validate-email-verification.js`);
const validatePasswordReset = require(`./email/validate-password-reset.js`);

if (!module.parent) {
    validate();
}

async function validate() {
    const app = firebase.initializeApp();
    const createResolvers = require(`../../src/index.js`);
    const resolvers = createResolvers(
        firebase.auth(),
        `AIzaSyC_wM5s8E7ZO0Ty6L5em6TCbmwLoNaTCBo`
    );
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
        if (await validateDelete(resolvers, source, context, info)) {
            console.log(chalk.green(`Deletion functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Deletion functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating creation functionality`)); // eslint-disable-line no-console
        if (await validateCreate(resolvers, source, context, info)) {
            console.log(chalk.green(`Creation functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Creation functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating update functionality`)); // eslint-disable-line no-console
        if (await validateUpdate(resolvers, source, context, info)) {
            console.log(chalk.green(`Update functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Update functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating find functionality`)); // eslint-disable-line no-console
        if (await validateFind(resolvers, source, context, info)) {
            console.log(chalk.green(`Find functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Find functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating list functionality`)); // eslint-disable-line no-console
        if (await validateList(resolvers, source, context, info)) {
            console.log(chalk.green(`List functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`List functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating email verification functionality`)); // eslint-disable-line no-console
        if (await validateEmailVerification(resolvers, source, context, info)) {
            console.log(chalk.green(`Email verification functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Email verification functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.yellow(`Validating password reset functionality`)); // eslint-disable-line no-console
        if (await validatePasswordReset(resolvers, source, context, info)) {
            console.log(chalk.green(`Password reset functionality has been validated`)); // eslint-disable-line no-console
        } else {
            console.log(chalk.red(`Password reset functionality has failed validation`)); // eslint-disable-line no-console
            return;
        }

        console.log(chalk.bold.green(`✓ All tests passed ✓`)); // eslint-disable-line no-console
    } finally {
        app.delete();
    }
}
