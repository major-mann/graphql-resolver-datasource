const { exec } = require(`child_process`),
    Generator = require(`yeoman-generator`),
    Case = require(`case`);

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([
            {
                type: `input`,
                name: `name`,
                message: `The name of the datasource`
            }
        ]);

        this.answers.capitalizedName = Case.pascal(this.answers.name);
    }

    async writing() {
        const self = this;
        const packageJson = JSON.parse(this.fs.read(this.templatePath(`package.json`), { encoding: `utf8` }));
        const [latest, devLatest] = await Promise.all([
            loadLatest(packageJson.dependencies),
            loadLatest(packageJson.devDependencies)
        ]);

        this.answers.latest = latest;
        this.answers.devLatest = devLatest;

        copyTemplates(``, [
            `package.json`,
            `.eslintrc`
        ]);

        copyTemplates(`src/`, [
            `create.js`,
            `delete.js`,
            `find.js`,
            `index.js`,
            `list.js`,
            `update.js`,
            `upsert.js`
        ]);

        copyTemplates(`test/`, [
            `.eslintrc`,
            `context.js`,
            `integration.js`,
            `create.spec.js`,
            `delete.spec.js`,
            `find.spec.js`,
            `index.spec.js`,
            `list.spec.js`,
            `update.spec.js`,
            `upsert.spec.js`
        ]);

        function copyTemplates(directory, names) {
            names.forEach(name => self.fs.copyTpl(
                self.templatePath(`${directory}${name}`),
                self.destinationPath(`${self.answers.name}/${directory}${name}`),
                self.answers
            ));
        }

        async function loadLatest(obj) {
            if (obj) {
                const result = {};
                await Promise.all(Object.keys(obj).map(async name => {
                    result[name] = await self.findLatest(name);
                }));
                return result;
            } else {
                return {};
            }
        }
    }

    findLatest(name) {
        return new Promise(function promiseHandler(resolve, reject) {
            exec(`npm show version "${name}"`, function onShowVersionComplete(err, out) {
                if (err) {
                    reject(err);
                } else {
                    resolve(out.trim());
                }
            });
        });
    }
};
