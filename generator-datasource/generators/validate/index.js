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
        this.answers = this.options;
        const prompts = [
            {
                type: `input`,
                name: `path`,
                message: `Select the file to execute against`
            }
        ].filter(prompt => !Object.keys(this.answers).includes(prompt.name));
        this.answers = Object.assign(this.answers, await this.prompt(prompts));
    }

    async writing() {

        const key = [`entertainerId`];

        const shape = {
            entertainerId: true,
            name: true,
            movies: true,
            nickname: true
        };

        this.resolvers = require(this.answers.path)(key, shape);

        const source = {};
        const info = {};
        const context = {
            log: {
                stat: {
                    increment: () => undefined,
                    decrement: () => undefined,
                    timing: () => undefined,
                    update: () => undefined,
                    gauge: () => undefined
                }
            }
        };

        this.log(chalk.yellow(`Validating deletion functionality`));
        if (await validateDelete(this.resolvers, source, context, info)) {
            this.log(chalk.green(`Deletion functionality has been validated`));
        } else {
            this.log(chalk.red(`Deletion functionality has failed validation`));
            return;
        }

        this.log(chalk.yellow(`Validating creation functionality`));
        if (await validateCreate(this.resolvers, source, context, info)) {
            this.log(chalk.green(`Creation functionality has been validated`));
        } else {
            this.log(chalk.red(`Creation functionality has failed validation`));
            return;
        }

        this.log(chalk.yellow(`Validating upsertion functionality`));
        if (await validateUpsert(this.resolvers, source, context, info)) {
            this.log(chalk.green(`Upsertion functionality has been validated`));
        } else {
            this.log(chalk.red(`Upsertion functionality has failed validation`));
            return;
        }

        this.log(chalk.yellow(`Validating update functionality`));
        if (await validateUpdate(this.resolvers, source, context, info)) {
            this.log(chalk.green(`Update functionality has been validated`));
        } else {
            this.log(chalk.red(`Update functionality has failed validation`));
            return;
        }

        this.log(chalk.yellow(`Validating find functionality`));
        if (await validateFind(this.resolvers, source, context, info)) {
            this.log(chalk.green(`Find functionality has been validated`));
        } else {
            this.log(chalk.red(`Find functionality has failed validation`));
            return;
        }

        this.log(chalk.yellow(`Validating list functionality`));
        if (await validateList(this.resolvers, source, context, info)) {
            this.log(chalk.green(`List functionality has been validated`));
        } else {
            this.log(chalk.red(`List functionality has failed validation`));
            return;
        }

        this.log(chalk.bold.green(`✓ All tests passed ✓`));
    }
};
