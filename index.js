#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {Command} = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

function printColorfulString(str) {
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const color = getRandomColor();
        process.stdout.write(chalk[color].underline.bold(char));
    }
    process.stdout.write('\n');
}

function getRandomColor() {
    const colors = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

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
        execSync('npm update --save', {cwd: this.projectPath, stdio: 'inherit'});
    }

    generateBoilerplate(choices) {
        process.stdout.write(`Creating project directory ${this.projectName}`);
        this.createProjectDirectory();
        if (choices.length === 0) {
            this.createBaseApp();
        }
        if (choices.indexOf('express') !== -1) {
            process.stdout.write(`Adding express`);
            this.createExpressApp();
        }
        // if (choices.indexOf('eslint') !== -1) {
        //   process.stdout.write(`Adding eslint`);
        // }
        // if (choices.indexOf('prettier') !== -1) {
        //   process.stdout.write(`Adding prettier`);
        // }
        process.stdout.write(`Installing dependencies...`);
        this.installDependencies();
        printColorfulString(`\n\n\TypedScript\n`);
        process.stdout.write(`\tcd ${this.projectName}\n`);
        process.stdout.write(`\tnpm run dev\n\n`)
    }
}

const program = new Command();

program.name('TypedScript').description('CLI tool for generating TypeScript boilerplate').version(require('./package.json').version);

program
    .command('create <name>')
    .description('Create an app in TypeScript')
    .action((name) => {
        const options = [
            {
                name: 'Web server (express)',
                value: 'express',
            },
            // TODO
            // {
            //     name: 'Linter (eslint)',
            //     value: 'eslint',
            // },
            // {
            //     name: 'Formatter (prettier)',
            //     value: 'prettier',
            // },
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
