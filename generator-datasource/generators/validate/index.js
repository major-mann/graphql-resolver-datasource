const path = require(`path`);
const Generator = require(`yeoman-generator`);
const chalk = require(`chalk`);
const { PathPrompt } = require(`inquirer-path`);
const validateDelete = require(`./validate-delete.js`);
const validateCreate = require(`./validate-create.js`);
const validateUpsert = require(`./validate-upsert.js`);
const validateUpdate = require(`./validate-update.js`);
const validateFind = require(`./validate-find.js`);
const validateList = require(`./validate-list.js`);

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.argument(`path`, {
            type: String,
            required: false,
            desc: `The path of the file to interrogate`
        });
    }
    initializing() {
        this.env.adapter.promptModule.registerPrompt(`path`, PathPrompt);
    }
    async prompting() {
        // TODO: Want to be able to select "explain" which will explain how to built a test file
        // Currently we only implement "validate"

        if (this.options && this.options.path) {
            this.options.path = path.resolve(process.cwd(), this.options.path);
        }

        this.answers = this.options;
        const prompts = [
            {
                type: `path`,
                name: `path`,
                message: `Select the file to execute against`
            }
        ].filter(prompt => !Object.keys(this.answers).includes(prompt.name));
        this.answers = Object.assign(this.answers, await this.prompt(prompts));
    }

    async writing() {
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
        await require(this.answers.path)(async (resolvers) => {
            this.log(chalk.yellow(`Validating deletion functionality`));
            if (await validateDelete(resolvers, source, context, info)) {
                this.log(chalk.green(`Deletion functionality has been validated`));
            } else {
                this.log(chalk.red(`Deletion functionality has failed validation`));
                return;
            }

            this.log(chalk.yellow(`Validating creation functionality`));
            if (await validateCreate(resolvers, source, context, info)) {
                this.log(chalk.green(`Creation functionality has been validated`));
            } else {
                this.log(chalk.red(`Creation functionality has failed validation`));
                return;
            }

            this.log(chalk.yellow(`Validating upsertion functionality`));
            if (await validateUpsert(resolvers, source, context, info)) {
                this.log(chalk.green(`Upsertion functionality has been validated`));
            } else {
                this.log(chalk.red(`Upsertion functionality has failed validation`));
                return;
            }

            this.log(chalk.yellow(`Validating update functionality`));
            if (await validateUpdate(resolvers, source, context, info)) {
                this.log(chalk.green(`Update functionality has been validated`));
            } else {
                this.log(chalk.red(`Update functionality has failed validation`));
                return;
            }

            this.log(chalk.yellow(`Validating find functionality`));
            if (await validateFind(resolvers, source, context, info)) {
                this.log(chalk.green(`Find functionality has been validated`));
            } else {
                this.log(chalk.red(`Find functionality has failed validation`));
                return;
            }

            this.log(chalk.yellow(`Validating list functionality`));
            if (await validateList(resolvers, source, context, info)) {
                this.log(chalk.green(`List functionality has been validated`));
            } else {
                this.log(chalk.red(`List functionality has failed validation`));
                return;
            }

            this.log(chalk.bold.green(`✓ All tests passed ✓`));
        });
    }
};
