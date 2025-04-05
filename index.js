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
    morgan: 'morgan@1.10.0',
    types_morgan: '@types/morgan@1.9.9',

    swagger_jsdoc: 'swagger-jsdoc@6.2.8',
    swagger_ui_express: 'swagger-ui-express@5.0.1',
    types_swagger_jsdoc: '@types/swagger-jsdoc@6.0.4',
    types_swagger_ui_express: '@types/swagger-ui-express@4.1.8',
}

class BoilerplateGenerator {
    devDependencies = [];
    dependencies = []

    choiceToMethod = {
        'nodemon': this.addNodemon,
        'dotenv': this.addDotenv,
        'swagger': this.addSwagger,
        'dockerfile': this.addDockerfile,
    }

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
        this.replaceTextInFile(path.join(this.projectPath, 'README.md'), '// [README]', `# ${this.projectName}`);
        this.editPackageJson('name', () => this.projectName);
        this.devDependencies.push(dependenciesVersions.ts_node, dependenciesVersions.typescript);
    }

    createExpressApp() {
        fs.cpSync(path.join(__dirname, '/templates/express'), this.projectPath, { recursive: true });
        this.replaceTextInFile(path.join(this.projectPath, 'README.md'), '// [README]', `# ${this.projectName}`);
        this.editPackageJson('name', () => this.projectName);
        this.devDependencies.push(dependenciesVersions.ts_node, dependenciesVersions.typescript, dependenciesVersions.types_morgan);
        this.dependencies.push(dependenciesVersions.express, dependenciesVersions.morgan);
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

        this.replaceTextInFile(indexPath, '// [DOTENV IMPORT]', dotenvText);
    }

    addSwagger() {
        this.dependencies.push(dependenciesVersions.swagger_jsdoc, dependenciesVersions.swagger_ui_express);
        this.devDependencies.push(dependenciesVersions.types_swagger_jsdoc, dependenciesVersions.types_swagger_ui_express);

        fs.copyFileSync(path.join(__dirname, '/templates/swagger/swagger.ts'), this.projectPath + '/src/swagger.ts');

        const indexPath = path.join(this.projectPath, 'src/index.ts');

        this.replaceTextInFile(indexPath, '// [SWAGGWER IMPORT]', `import { setupSwagger } from './swagger';\n`);
        this.replaceTextInFile(indexPath, '// [SWAGGER SETUP]', 'setupSwagger(app);\n');
        this.replaceTextInFile(indexPath, '// [SWAGGER LOG]', 'console.log(`📚 Swagger docs available at http://localhost:${PORT}/docs`);\n');
    }

    addDockerfile() {
        fs.copyFileSync(path.join(__dirname, '/templates/config-files/Dockerfile'), this.projectPath + '/Dockerfile');
        fs.copyFileSync(path.join(__dirname, '/templates/config-files/.dockerignore'), this.projectPath + '/.dockerignore');
        this.editPackageJson('scripts', (value) => {
            return { ...value, 'build:docker': `docker build -t ${this.projectName} .` };
        });
    }

    clearPlaceholders() {
        // Remove all placeholders from the files
        const files = fs.readdirSync(this.projectPath, { recursive: true });
        files.forEach((file) => {
            const filePath = path.join(this.projectPath, file);
            if (fs.statSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const updatedContent = content.replace(/\/\/\s*\[.*?\]/g, '');
                fs.writeFileSync(filePath, updatedContent, 'utf-8');
            }
        });
    }

    replaceTextInFile(filePath, searchValue, replaceValue) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        const updatedContent = content.replace(searchValue, replaceValue);

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

            choices.forEach((choice) => {
                if (this.choiceToMethod[choice]) {
                    process.stdout.write(`Adding ${choice}\n`);
                    this.choiceToMethod[choice].call(this);
                }
            });

            this.clearPlaceholders();
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
                // { name: 'Dockerfile', value: 'dockerfile' },
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
