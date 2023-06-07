#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {Command} = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

class BoilerplateGenerator {
    constructor(projectName) {
        this.projectName = projectName;
        this.projectPath = path.join(process.cwd(), this.projectName);
    }

    createProjectDirectory() {
        fs.mkdirSync(this.projectPath);
    }

    createBaseApp() {
        fs.cpSync(path.join(process.cwd(), '/templates/base'), this.projectPath, {recursive: true});
    }

    createExpressApp() {
        fs.cpSync(path.join(process.cwd(), '/templates/express'), this.projectPath, {recursive: true});
    }

    installDependencies() {
        execSync('npm update --save', {cwd: this.projectPath});
    }

    generateBoilerplate(choices) {
        console.log(`[typedscript-cli]: Creating project directory ${this.projectName}`);
        this.createProjectDirectory();
        if (choices.length === 0) {
            this.createBaseApp();
        }
        if (choices.indexOf('express') !== -1) {
          console.log(`[typedscript-cli]: Adding express`);
            this.createExpressApp();
        }
        if (choices.indexOf('winston') !== -1) {
          console.log(`[typedscript-cli]: Adding winston`);
        }
        if (choices.indexOf('eslint') !== -1) {
          console.log(`[typedscript-cli]: Adding eslint`);
        }
        if (choices.indexOf('prettier') !== -1) {
          console.log(`[typedscript-cli]: Adding prettier`);
        }
        if (choices.indexOf('jest') !== -1) {
          console.log(`[typedscript-cli]: Adding jest`);
        }
        console.log(`[typedscript-cli]: Installing dependencies...`);
        this.installDependencies();
        console.log(`[typedscript-cli]: Done!`);
    }
}

const program = new Command();

program.name('typedscript-cli').description('CLI tool for generating TypeScript boilerplate').version(require('./package.json').version);

program
    .command('create <name>')
    .description('Create a new Express app in TypeScript')
    .action((name) => {
        const options = [
            {
                name: 'Web server (express)',
                value: 'express',
            },
            {
                name: 'Logger (winston)',
                value: 'winston',
            },
            {
                name: 'Linter (eslint)',
                value: 'eslint',
            },
            {
                name: 'Formatter (prettier)',
                value: 'prettier',
            },
            {
                name: 'Tester (jest)',
                value: 'jest',
            },
        ];

        inquirer
            .prompt([
                {
                    type: 'checkbox',
                    name: 'choice',
                    message: 'Check the features needed for your project:',
                    choices: options.map((option) => ({
                        name: option.name,
                        value: option.value,
                    })),
                },
            ])
            .then((answers) => {
                const generator = new BoilerplateGenerator(name);
                generator.generateBoilerplate(answers.choice);
            });
    });

program.parse(process.argv);
