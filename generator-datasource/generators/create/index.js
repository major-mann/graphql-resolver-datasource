const Generator = require('yeoman-generator');

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([
            {
                type: `input`,
                name: `name`,
                message: `The name of the datasource`
            }
        ]);
    }

    writing() {
        
    }
};