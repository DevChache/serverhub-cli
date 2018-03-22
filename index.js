#!/usr/bin/env node

const program = require('commander');
const package = require('./package.json');
const path = require('path');
const fs = require('fs-extra');
const spawnSync = require('child_process').spawnSync;
const spawn = require('child_process').spawn;

function createWorkspace(targetpath, demo) {
    let app_js = fs.readFileSync(path.resolve(__dirname, './content/app.js'));

    fs.mkdirSync(path.resolve(targetpath, 'controller'));
    fs.mkdirSync(path.resolve(targetpath, 'view'));
    fs.mkdirSync(path.resolve(targetpath, 'model'));
    fs.mkdirSync(path.resolve(targetpath, 'www'));
    fs.writeFileSync(path.resolve(targetpath, '.', 'app.js'), app_js, { encoding: "utf-8" });
    if (demo) {
        let home_js = fs.readFileSync(path.resolve(__dirname, './content/home.js'));
        let home_json = fs.readFileSync(path.resolve(__dirname, './content/home.json'));
        let home_html = fs.readFileSync(path.resolve(__dirname, './content/home.html'));
        let global_js = fs.readFileSync(path.resolve(__dirname, './content/global.js'));
        let global_css = fs.readFileSync(path.resolve(__dirname, './content/global.css'));
        fs.writeFileSync(path.resolve(targetpath, 'controller', 'home.js'), home_js, { encoding: "utf-8" });
        fs.writeFileSync(path.resolve(targetpath, 'view', 'home.html'), home_html, { encoding: "utf-8" });
        fs.writeFileSync(path.resolve(targetpath, 'model', 'home.json'), home_json, { encoding: "utf-8" });
        fs.writeFileSync(path.resolve(targetpath, 'www', 'global.css'), global_css, { encoding: "utf-8" });
        fs.writeFileSync(path.resolve(targetpath, 'www', 'global.js'), global_js, { encoding: "utf-8" });
    }
    console.log('Done creating workspace' + (demo ? ' with demo.' : '.'));
    console.log('Don\'t forget to install and import serverhub module before run `node app.js`');
}

const gitRegex = /^(?:https:\/\/)?github\.com\/[a-zA-Z\d]*(?:[a-zA-Z\d]+-)*[a-zA-Z\d]+\/[a-zA-Z\d]*(?:[a-zA-Z\d]+-)*[a-zA-Z\d]+\.git$/g;

const templates = [{
    name: 'template',
    git: 'https://github.com/ServerHubOrg/serverhub-template.git'
}];

const gitstructures = ['.git/', '.gitignore'];
function removeGitStructure(targetpath) {
    if (targetpath === '/') {
        console.error('Illegal operation!');
        process.exit(1);
    }
    let noerr = true;
    gitstructures.forEach(t => {
        let ta = path.resolve(targetpath, t);
        let clean_process = spawn('rm', ['-rf', ta]);
        clean_process.on('exit', (code, signal) => {
            if (code !== 0) {
                console.error(`Cannot clean target ${ta}`);
                noerr = false;
            } else {
                console.log(`Cleaned target ${ta}`);
            }
        });
        clean_process.stdout.on('data', (m) => {
            console.log(m.toString());
        });
        clean_process.stderr.on('data', (m) => {
            console.error(m.toString());
        });
    });
}

function cloneGitRepo(url) {
    console.log(`Ready to clone template from ${url}`);
    let git_clone_process = spawn('git', ['clone', url, './']);
    git_clone_process.on('exit', (code, signal) => {
        if (code !== 0) {
            console.error('Cannot perform clone operations.');
            process.exit(1);
        } else {
            console.log('Cloned with no error.');
            removeGitStructure(process.cwd());
        }
    });
    git_clone_process.on('message', (m) => {
        console.log(m.toString());
    })
    git_clone_process.stdout.on('data', (m) => {
        console.log(m.toString());
    });
    git_clone_process.stderr.on('data', (m) => {
        console.error(m.toString());
    });
}

function processTemplate(target) {
    if (gitRegex.test(target)) {
        // git address.
        console.error(`${package.version} of serverhub-cli does not support 3-party templates.`);
        process.exit(1);
    } else {
        // shortcut.
        let found = false;
        templates.forEach(template => {
            if (template.name === target) {
                // found template;
                cloneGitRepo(template.git);
                found = true;
            }
        });
        if (!found) {
            console.error('No such template!');
            process.exit(1);
        }
    }
}

program
    .version(package.version)
    .usage('serverhub [command] [options]')

program
    .command('init [target]')
    .option('-f, --force', "Force initialize the workspace")
    .action((target, options) => {
        if (!target) {
            console.log("Initialization configuration type/name is required.");
            process.exit(1);
        }

        if (target === 'bare') {
            let targetPath = path.resolve(process.cwd());
            console.info('About to create workspace in: ', targetPath, '\n');
            if (options.hard) {
                fs.emptyDirSync(targetPath);
                console.info('Directory cleared');
                createWorkspace(targetPath, true);
            } else {
                fs.readdir(targetPath, (err, files) => {
                    if (!err) {
                        if (!options.hard && files.length > 0) {
                            console.log('Directory is not empty, try clean it manually or add -f option');
                        } else {
                            createWorkspace(targetPath, options.demo ? true : false);
                        }
                    }
                });
            }
        } else {
            if (fs.readdirSync(process.cwd()).length !== 0 && !options.hard) {
                console.error('Directory is not empty. Try -f/--force to ignore the warning.');
                process.exit(1);
            } else {
                if (fs.readdirSync(process.cwd()).length !== 0 && options.hard)
                    fs.emptyDirSync(process.cwd());
                processTemplate(target);
            }
        }
    });

program.command('help <cmd>')
    .action((cmd) => {
        if (cmd === 'init') {
            console.log(`Create workspace for serverhub to run.
            
ARGS:
- target: The target type of the template you want to initialize.
  supported target:
  > bare: create an empty template with basic configuration and support files.
  > [git-repository]: example: https://github.com/ServerHubOrg/serverhub-template.git.
  
OPTIONS:
-f, --force: To create workspace even when directory not empty.`);
        } else if (cmd === 'help') {
            console.log(`Print the help message of any command.\n use serverhub-cli help <command>.`);
        } else {
            console.error(`${cmd} is not a valid argument.`);
        }
    })
program.parse(process.argv);