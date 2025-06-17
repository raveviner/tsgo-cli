#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const readline = require('readline');

function createBoilerplateGenerator(projectRelativePath) {
    // Helper function to copy directory with empty folders
    function copyDirRecursiveSync(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                // Create directory even if it's empty
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                // Recursively copy contents
                copyDirRecursiveSync(srcPath, destPath);
            } else {
                // Copy file
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    
    const boilerplateTypeToAction = {
        monorepo: () => {
            // Use custom function to ensure empty folders are copied
            copyDirRecursiveSync(path.join(__dirname, '/templates/monorepo'), projectPath);
            replaceTextInFile(path.join(projectPath, 'README.md'), '// [README]', `# ${projectName}`);
        },
        fastify: () => {
            // Use custom function to ensure empty folders are copied
            copyDirRecursiveSync(path.join(__dirname, '/templates/fastify'), projectPath);
            replaceTextInFile(path.join(projectPath, 'README.md'), '// [README]', `# ${projectName}`);
            editPackageJson('name', () => projectName);
        },
        package: () => {
            // Use custom function to ensure empty folders are copied
            copyDirRecursiveSync(path.join(__dirname, '/templates/package'), projectPath);
            replaceTextInFile(path.join(projectPath, 'README.md'), '// [README]', `# ${projectName}`);
            editPackageJson('name', () => projectName);
        },
        empty: () => {
            // Use custom function to ensure empty folders are copied
            copyDirRecursiveSync(path.join(__dirname, '/templates/empty'), projectPath);
            replaceTextInFile(path.join(projectPath, 'README.md'), '// [README]', `# ${projectName}`);
            editPackageJson('name', () => projectName);
        },
    }

    const projectPath = path.join(process.cwd(), projectRelativePath);
    const projectName = projectRelativePath.split('/').pop();

    function createProjectDirectory() {
        return new Promise((resolve) => {
            if (fs.existsSync(projectPath)) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                rl.question(`Destination folder '${projectPath}' already exists. Do you want to overwrite it? (yes/no): `, (answer) => {
                    if (!['yes', 'y'].includes(answer.toLowerCase())) {
                        process.stdout.write('Aborted.\n');
                        process.exit(0);
                    }
                    try {
                        fs.rmSync(projectPath, { recursive: true });
                        fs.mkdirSync(projectPath);
                        rl.close();
                        resolve();
                    } catch (e) {
                        process.stdout.write('Failed to remove directory.\n');
                        process.exit(1);
                    }
                });
            } else {
                fs.mkdirSync(projectPath);
                resolve();
            }
        });
    }

    function installDependencies() {
        execSync(`npm install`, { cwd: projectPath, stdio: 'inherit' });
    }

    function replaceTextInFile(filePath, searchValue, replaceValue) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        const updatedContent = content.replace(searchValue, replaceValue);

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
    }

    function editPackageJson(field, cb) {
        editJson('package.json', field, cb);
    }

    function editJson(file, field, cb) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, file)).toString());
        packageJson[field] = cb(packageJson[field]);
        fs.writeFileSync(path.join(projectPath, file), JSON.stringify(packageJson, null, 2));
    }

    function getBoilerplateChoices() {
        return Object.keys(boilerplateTypeToAction).map((key) => ({
            name: key,
            value: key,
        }));
    }

    async function generateBoilerplate(type) {
        process.stdout.write(`Creating project directory ${projectName}\n`);
        await createProjectDirectory()
        await boilerplateTypeToAction[type]();
        if (type === 'monorepo') {
            process.stdout.write(`🪬  Successfully created project.\n`);
        } else {
            process.stdout.write(`Installing dependencies...\n`);
            installDependencies();
            process.stdout.write(`\n`);
            console.log(figlet.textSync('tsgo cli', 'univers'));
            process.stdout.write(`\n`);
            process.stdout.write(`🪬  Successfully created project.\n`);
            process.stdout.write(`🪬  Get started with the following commands:\n`);
            process.stdout.write(`\n`);
            process.stdout.write(`   cd ${projectName}\n`);
            process.stdout.write(`   npm run dev\n\n`);
        }
    }

    return {
        generateBoilerplate,
        getBoilerplateChoices
    }
}

const program = new Command();

program.name('tsgo').description('CLI tool for generating TypeScript boilerplate').version(require('./package.json').version);

program.command('create <name>')
    .description('Create an app in TypeScript')
    .action(async (name) => {
        const generator = createBoilerplateGenerator(name);

        const { type } = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What type of boilerplate do you want to generate?',
                choices: generator.getBoilerplateChoices(),
            },
        ]);

        generator.generateBoilerplate(type)
    });

program.parse(process.argv);

// async function generateBoilerplate(name, type) {
//     process.stdout.write(`Creating project directory ${name}\n`);
//     await createProjectDirectory()
//     // if (projectType === 'service-express') {
//     //     createExpressApp();
//     // } else {
//     //     createBaseApp();
//     // }

//     // choices.forEach((choice) => {
//     //     if (choiceToMethod[choice]) {
//     //         process.stdout.write(`Adding ${choice}\n`);
//     //         choiceToMethod[choice].call(this);
//     //     }
//     // });

//     // clearPlaceholders();
//     process.stdout.write(`Installing dependencies...\n`);
//     installDependencies();
//     process.stdout.write(`\n`);
//     console.log(figlet.textSync('tsgo cli', 'univers'));
//     process.stdout.write(`\n`);
//     process.stdout.write(`🪬  Successfully created project.\n`);
//     process.stdout.write(`🪬  Get started with the following commands:\n`);
//     process.stdout.write(`\n`);
//     process.stdout.write(`   cd ${name}\n`);
//     process.stdout.write(`   npm run start\n\n`);

// }

// async function createProjectDirectory() {
//     return new Promise((resolve) => {
//         if (fs.existsSync(projectPath)) {
//             const rl = readline.createInterface({
//                 input: process.stdin,
//                 output: process.stdout,
//             });

//             rl.question(`Destination folder '${projectPath}' already exists. Do you want to overwrite it? (yes/no): `, (answer) => {
//                 if (!['yes', 'y'].includes(answer.toLowerCase())) {
//                     process.stdout.write('Aborted.\n');
//                     process.exit(0);
//                 }
//                 try {
//                     fs.rmSync(projectPath, { recursive: true });
//                     fs.mkdirSync(projectPath);
//                     rl.close();
//                     resolve();
//                 } catch (e) {
//                     process.stdout.write('Failed to remove directory.\n');
//                     process.exit(1);
//                 }
//             });
//         } else {
//             fs.mkdirSync(projectPath);
//             resolve();
//         }
//     });
// }

// function replaceTextInFile(filePath, searchValue, replaceValue) {
//     if (!fs.existsSync(filePath)) {
//         throw new Error(`File does not exist: ${filePath}`);
//     }
//     const content = fs.readFileSync(filePath, 'utf-8');
//     const updatedContent = content.replace(searchValue, replaceValue);
//     fs.writeFileSync(filePath, updatedContent, 'utf-8');
// }

// function editPackageJson(field, cb) {
//     editJson('package.json', field, cb);
// }

// function editJson(file, field, cb) {
//     const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, file)).toString());
//     packageJson[field] = cb(packageJson[field]);
//     fs.writeFileSync(path.join(projectPath, file), JSON.stringify(packageJson, null, 2));
// }

