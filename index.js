#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const inquirer = __importStar(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const shell = __importStar(require("shelljs"));
const figlet_1 = __importDefault(require("figlet"));
// const template = __importStar(require("./utils/template"));
const withTitle = (cli) => (0, figlet_1.default)("NestJS App", function (err, data) {
    if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
    }
    console.clear();
    console.log(data);
    console.log(chalk_1.default.dim(`\n\nNestJS template configured with\n\n${chalk_1.default.underline.bgYellow.black("Docker")} ${chalk_1.default.underline.bgYellow.black("TypeORM")} ${chalk_1.default.underline.bgYellow.black("JWT")} ${chalk_1.default.underline.bgYellow.black("Rate Limiter")} ${chalk_1.default.underline.bgYellow.black("Swagger")}\n\n${chalk_1.default.underline.bgYellow.black("Health Check")} ${chalk_1.default.underline.bgYellow.black("Logging")} ${chalk_1.default.underline.bgYellow.black("Validation Pipe")} ${chalk_1.default.underline.bgYellow.black("Exception Filter")} ${chalk_1.default.underline.bgYellow.black("Slack Notification")}`));
    console.log(chalk_1.default.dim(`\nTemplate can be found at\n\n${chalk_1.default.green("https://github.com/jeus0630/nest-template")}\n`));
    cli();
});
const QUESTIONS = [
    {
        name: "name",
        type: "input",
        message: "Please input a new project name:",
    }
];
const CURR_DIR = process.cwd();
withTitle(() => inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = "nest-template";
    const projectName = answers["name"];
    const templatePath = path.join(__dirname, "templates", projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const options = {
        projectName,
        templateName: projectChoice,
        templatePath,
        tartgetPath,
        packageManagerChoice: "yarn",
    };
    if (!createProject(options.tartgetPath)) {
        return;
    }
    createDirectoryContents(options.templatePath, options.projectName);
    postProcess(options);
}));
function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk_1.default.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }
    fs.mkdirSync(projectPath);
    return true;
}
const SKIP_FILES = ["node_modules", ".template.json"];
function createDirectoryContents(templatePath, projectName) {
    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach((file) => {
        const origFilePath = path.join(templatePath, file);
        // get stats about the current file
        const stats = fs.statSync(origFilePath);
        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {

            // read file content and transform it using template engine
            let contents = fs.readFileSync(origFilePath, "utf8");
            // contents = template.render(contents, { projectName });
            // write file to destination folder
            const writePath = path.join(CURR_DIR, projectName, file === "_gitignore" ? ".gitignore" : file);
            if (file === "package.json") {
                contents = contents.replace("nest-template", projectName);
            }
            fs.writeFileSync(writePath, contents, "utf8");
        }
        else if (stats.isDirectory()) {
            // create folder in destination folder
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}
function postProcess(options) {
    const isNode = fs.existsSync(path.join(options.templatePath, "package.json"));
    if (isNode) {
        shell.cd(options.tartgetPath);
        shell.exec("git init", () => {
            console.log(chalk_1.default.underline.bgMagenta.white("\nNew project created successfully!"));
            console.log(chalk_1.default.dim("\n\nChange directory into your project folder:"));
            console.log(chalk_1.default.yellow(`  cd ${options.projectName}`));
            console.log(chalk_1.default.dim("\nInstall dependencies:"));
            console.log(chalk_1.default.yellow(`  yarn`));
            console.log(chalk_1.default.dim("\nConfigure app:"));
            console.log(chalk_1.default.yellow(`  docker-compose up -d`));
            console.log(chalk_1.default.dim("\nCopy & Update env:"));
            console.log(chalk_1.default.yellow(`  cp .env.template .development.env`));
            console.log(chalk_1.default.dim("\nRun app:"));
            console.log(chalk_1.default.yellow(`  yarn start:dev`));
            console.log(chalk_1.default.green("\nEnjoy!\n"));
        })
    }
    return true;
}
