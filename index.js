#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const readline = require('readline');

class BoilerplateGenerator {
    devDependencies = [];

    constructor(projectName) {
        this.projectName = projectName;
        this.projectPath = path.join(process.cwd(), this.projectName);
    }

    createProjectDirectory() {
        return new Promise((resolve) => {
            if (fs.existsSync(this.projectPath)) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                rl.question(`Destination folder '${this.projectPath}' already exists. Do you want to overwrite it? (yes/no): `, (answer) => {
                    if (!['yes', 'y'].includes(answer.toLowerCase())) {
                        process.stdout.write('Aborted.\n');
                        process.exit(0);
                    }
                    try {
                        fs.rmSync(this.projectPath, { recursive: true });
                        fs.mkdirSync(this.projectPath);
                        rl.close();
                        resolve();
                    } catch (e) {
                        process.stdout.write('Failed to remove directory.\n');
                        process.exit(1);
                    }
                });
            } else {
                fs.mkdirSync(this.projectPath);
                resolve();
            }
        });
    }

    createBaseApp() {
        fs.cpSync(path.join(__dirname, '/templates/base'), this.projectPath, { recursive: true });
        this.editPackageJson('name', () => this.projectName);
        this.devDependencies.push('ts-node', 'typescript');
    }

    installDependencies() {
        execSync(`npm install ${this.devDependencies.join(' ')} --save-dev`, { cwd: this.projectPath, stdio: 'inherit' });
    }

    addNodemon() {
        this.devDependencies.push('nodemon');
        this.editPackageJson('scripts', (value) => {
            return { ...value, 'start:watch': 'nodemon src/index.ts' };
        });
    }

    addDotenv() {
        this.devDependencies.push('dotenv');
        fs.writeFileSync(path.join(this.projectPath, '.env'), '');
    }

    addEslint() {
        this.devDependencies.push('eslint');
        fs.copyFileSync(path.join(__dirname, '/templates/config-files/.eslintrc'), path.join(this.projectPath, '.eslintrc'));
        this.editPackageJson('scripts', (value) => {
            return { ...value, lint: "eslint '**/*.ts'", 'lint:fix': "eslint --fix '**/*.ts'" };
        });
    }

    addPrettier(withEslint = false) {
        this.devDependencies.push('prettier');
        if(withEslint) {
            this.devDependencies.push('eslint-config-prettier');
            this.editJson('.eslintrc', 'extends', (value) => {
                return [value, 'prettier'];
            });
        }
        fs.copyFileSync(path.join(__dirname, '/templates/config-files/.prettierrc'), path.join(this.projectPath, '.prettierrc'));
        fs.copyFileSync(path.join(__dirname, '/templates/config-files/.prettierignore'), path.join(this.projectPath, '.prettierignore'));
        this.editPackageJson('scripts', (value) => {
            return { ...value, 'prettier:fix': 'prettier . --write', prettier: 'prettier . --check' };
        });
    }

    editPackageJson(field, cb) {
       this.editJson('package.json', field, cb);
    }

    editJson(file, field, cb) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectPath, file)).toString());
        packageJson[field] = cb(packageJson[field]);
        fs.writeFileSync(path.join(this.projectPath, file), JSON.stringify(packageJson, null, 2));
    }

    generateBoilerplate(choices) {
        process.stdout.write(`Creating project directory ${this.projectName}\n`);
        this.createProjectDirectory().then(() => {
            this.createBaseApp();

            if (choices.indexOf('nodemon') !== -1) {
                process.stdout.write(`Adding nodemon\n`);
                this.addNodemon();
            }

            if (choices.indexOf('dotenv') !== -1) {
                process.stdout.write(`Adding dotenv\n`);
                this.addDotenv();
            }
            if (choices.indexOf('eslint') !== -1) {
                process.stdout.write(`Adding eslint\n`);
                this.addEslint();
            }
            if (choices.indexOf('prettier') !== -1) {
                process.stdout.write(`Adding prettier\n`);
                this.addPrettier(choices.indexOf('eslint') !== -1);
            }
            process.stdout.write(`Installing dependencies...\n`);
            this.installDependencies();
            process.stdout.write(`\n`);
            console.log(figlet.textSync('tsgo cli', 'univers'));
            process.stdout.write(`\n`);
            process.stdout.write(`🪬  Successfully created project.\n`);
            process.stdout.write(`🪬  Get started with the following commands:\n`);
            process.stdout.write(`\n`);
            process.stdout.write(`   cd ${this.projectName}\n`);
            process.stdout.write(`   npm run start\n\n`);
        });
    }
}

const program = new Command();

program.name('tsgo').description('CLI tool for generating TypeScript boilerplate').version(require('./package.json').version);

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
