#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');

class BoilerplateGenerator {
    constructor(projectName) {
        this.projectName = projectName;
        this.projectPath = path.join(process.cwd(), this.projectName);
    }

    createProjectDirectory() {
        fs.mkdirSync(this.projectPath);
    }

    createExpressApp() {
        fs.cpSync(path.join(process.cwd(), '/templates/base'), this.projectPath, { recursive: true });
    }
    installDependencies() {
        execSync('npm update --save', { cwd: this.projectPath });
    }

    generateBoilerplate() {
        this.createProjectDirectory();
        this.createExpressApp();
        this.installDependencies();

        console.log(`Boilerplate for Express.js with TypeScript and Winston logger generated in ${this.projectName}`);
    }
}

const program = new Command();

program
  .name('typedscript-cli')
  .description('CLI tool for generating TypeScript boilerplate')
  .version('0.0.1');

program
  .command('create <name>')
  .description('Create a new Express app in TypeScript')
  .action(name => {
    const generator = new BoilerplateGenerator(name);
    generator.generateBoilerplate();
  });

program.parse(process.argv);
