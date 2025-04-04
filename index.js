#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const readline = require('readline');

const dependenciesVersions = {
    ts_node: 'ts-node@10.9.2',
    nodemon: 'nodemon@3.1.9',
    typescript: 'typescript@5.8.2',
    dotenv: 'dotenv@16.4.7',

    express: 'express@5.1.0',

    swagger_jsdoc: 'swagger-jsdoc@6.2.8',
    swagger_ui_express: 'swagger-ui-express@5.0.1',
    types_swagger_jsdoc: '@types/swagger-jsdoc@6.0.4',
    types_swagger_ui_express: '@types/swagger-ui-express@4.1.8',
}

class BoilerplateGenerator {
    devDependencies = [];
    dependencies = []

    constructor(projectName, projectType) {
        this.projectName = projectType === 'service-express' ? `${projectName}-service` : projectName;
        this.projectPath = path.join(process.cwd(), this.projectName);
        this.projectType = projectType;
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
        this.devDependencies.push(dependenciesVersions.ts_node, dependenciesVersions.typescript);
    }

    createExpressApp() {
        fs.cpSync(path.join(__dirname, '/templates/express'), this.projectPath, { recursive: true });
        this.editPackageJson('name', () => this.projectName);
        this.devDependencies.push(dependenciesVersions.ts_node, dependenciesVersions.typescript);
        this.dependencies.push(dependenciesVersions.express);
    }

    installDependencies() {
        execSync(`npm install ${this.devDependencies.join(' ')} --save-dev`, { cwd: this.projectPath, stdio: 'inherit' });
        execSync(`npm install ${this.dependencies.join(' ')} --save`, { cwd: this.projectPath, stdio: 'inherit' });
    }

    addNodemon() {
        this.devDependencies.push(dependenciesVersions.nodemon);
        this.editPackageJson('scripts', (value) => {
            return { ...value, 'dev': 'nodemon src/index.ts' };
        });
    }

    addDotenv() {
        this.devDependencies.push(dependenciesVersions.dotenv);
        fs.writeFileSync(path.join(this.projectPath, '.env'), '');

        const indexPath = path.join(this.projectPath, 'src/index.ts');
        const dotenvText = `import dotenv from 'dotenv';\ndotenv.config();\n`;

        this.insertTextAfter(indexPath, dotenvText);
    }

    addSwagger() {
        this.dependencies.push(dependenciesVersions.swagger_jsdoc, dependenciesVersions.swagger_ui_express);
        this.devDependencies.push(dependenciesVersions.types_swagger_jsdoc, dependenciesVersions.types_swagger_ui_express);

        fs.copyFileSync(path.join(__dirname, '/templates/swagger/swagger.ts'), this.projectPath + '/src/swagger.ts');

        const indexPath = path.join(this.projectPath, 'src/index.ts');
        const swaggerImport = `import { setupSwagger } from './swagger';\n`;

        this.insertTextAfter(indexPath, swaggerImport);

        const swaggerSetup = `\n\tsetupSwagger(app);\n`;
        this.insertTextAfter(indexPath, swaggerSetup, 'const app = await createApp(logger);');

        this.insertTextAfter(indexPath, '\n\t\tconsole.log(`📚 Swagger docs available at http://localhost:${PORT}/docs`);\n', 'console.log(`🚀 Service listening at http://localhost:${PORT}`);');
    }

    insertTextAfter(filePath, textToInsert, insertAfter) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        if (!insertAfter) {
            // Insert at the top of the file
            const updatedContent = textToInsert + content;
            fs.writeFileSync(filePath, updatedContent, 'utf-8');
            return;
        }

        const index = content.indexOf(insertAfter);
        if (index === -1) {
            throw new Error(`Marker '${insertAfter}' not found in file.`);
        }

        const insertPosition = index + insertAfter.length;
        const updatedContent =
            content.slice(0, insertPosition) + textToInsert + content.slice(insertPosition);

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
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
            if (this.projectType === 'service-express') {
                this.createExpressApp();
            } else {
                this.createBaseApp();
            }

            if (choices.indexOf('nodemon') !== -1) {
                process.stdout.write(`Adding nodemon\n`);
                this.addNodemon();
            }

            if (choices.indexOf('dotenv') !== -1) {
                process.stdout.write(`Adding dotenv\n`);
                this.addDotenv();
            }

            if (choices.indexOf('swagger') !== -1) {
                process.stdout.write(`Adding swagger\n`);
                this.addSwagger();
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

program.command('create <name>')
    .description('Create an app in TypeScript')
    .action(async (name) => {

        const typeOptions = [
            {
                name: 'service (express)',
                value: 'service-express',
            },
            {
                name: 'package',
                value: 'package',
            },
            {
                name: 'empty',
                value: 'empty',
            },
        ];
        const { type } = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What type of boilerplate do you want to generate?',
                choices: typeOptions,
            },
        ]);

        let features = [];

        if (type === 'service-express' || type === 'package') {
            const featureOptions = [
                { name: 'Nodemon (hot reload)', value: 'nodemon' },
                { name: 'Dotenv (env variables)', value: 'dotenv' },
                // { name: 'ESLint (linter)', value: 'eslint' },
                // { name: 'Prettier (formatter)', value: 'prettier' },
            ];

            if (type === 'service-express') {
                featureOptions.push({ name: 'Swagger (API documentation)', value: 'swagger' });
            }

            const featurePrompt = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'features',
                    message: 'Select features to include:',
                    choices: featureOptions,
                },
            ]);

            features = featurePrompt.features;
        }

        const generator = new BoilerplateGenerator(name, type);
        generator.generateBoilerplate(features);
    }
    );

program.parse(process.argv);
