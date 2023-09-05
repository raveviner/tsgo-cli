#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
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
    devDependencies = [];

    constructor(projectName) {
        this.projectName = projectName;
        this.projectPath = path.join(process.cwd(), this.projectName);
    }

    createProjectDirectory() {
        fs.mkdirSync(this.projectPath);
    }

    createBaseApp() {
        fs.cpSync(path.join(process.cwd(), '/templates/base'), this.projectPath, { recursive: true });
        this.editPackageJson('name', () => this.projectName);
        this.devDependencies.push('ts-node', 'typescript');
    }

    installDependencies() {
        execSync(`npm install ${this.devDependencies.join(' ')} --save-dev`, { cwd: this.projectPath, stdio: 'inherit' });
    }

    addNodemon() {
        this.devDependencies.push('nodemon');
        this.editPackageJson('scripts', (value) => {
            return { ...value, dev: 'nodemon src/index.ts' };
        });
    }

    addDotenv() {
        this.devDependencies.push('dotenv');
        fs.writeFileSync(path.join(this.projectPath, '.env'), '');
    }

    addEslint() {
        this.devDependencies.push('eslint');
        fs.writeFileSync(path.join(this.projectPath, '.eslintrc.json'), '');
        this.editPackageJson('scripts', (value) => {
            return { ...value, lint: 'eslint .', 'lint:fix': 'eslint --fix .' };
        });
    }

    addPrettier() {
        this.devDependencies.push('prettier');
        fs.writeFileSync(path.join(this.projectPath, '.prettierrc.json'), '');
        this.editPackageJson('scripts', (value) => {
            return { ...value, format: 'prettier . --write"' };
        });
    }

    editPackageJson(field, cb) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json')).toString());
        packageJson[field] = cb(packageJson[field]);
        fs.writeFileSync(path.join(this.projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    }

    generateBoilerplate(choices) {
        process.stdout.write(`Creating project directory ${this.projectName}`);
        this.createProjectDirectory();
        this.createBaseApp();

        if (choices.indexOf('nodemon') !== -1) {
            process.stdout.write(`Adding nodemon`);
            this.addNodemon();
        }

        if (choices.indexOf('dotenv') !== -1) {
            process.stdout.write(`Adding dotenv`);
            this.addDotenv();
        }
        if (choices.indexOf('eslint') !== -1) {
            process.stdout.write(`Adding eslint`);
            this.addEslint();
        }
        if (choices.indexOf('prettier') !== -1) {
            process.stdout.write(`Adding prettier`);
            this.addPrettier();
        }
        process.stdout.write(`Installing dependencies...`);
        this.installDependencies();
        printColorfulString(`\n\n\TypedScript\n`);
        process.stdout.write(`\tcd ${this.projectName}\n`);
        process.stdout.write(`\tnpm run dev\n\n`);
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
                name: 'nodemon (hot reload)',
                value: 'nodemon',
            },
            {
                name: 'Dotenv (env variables)',
                value: 'dotenv',
            },
            {
                name: 'Linter (eslint)',
                value: 'eslint',
            },
            {
                name: 'Formatter (prettier)',
                value: 'prettier',
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
