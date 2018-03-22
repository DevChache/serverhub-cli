#!/usr/bin/env node

const program = require('commander');
const package = require('./package.json');
const path = require('path');
const fs = require('fs-extra');

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

program
    .version(package.version)
    .usage('serverhub [command] [options]')

program
    .command('init [directory]')
    .option('-h, --hard', "Force initialize the workspace")
    .option('-d, --demo', "Create a demo in the directory")
    .action((directory, options) => {
        if (!directory) {
            console.log("Target directory is required.");
            process.exit(1);
        }
        let targetPath = path.resolve(process.cwd(), directory);
        console.log('About to create workspace in: ', targetPath, '\n');
        if (options.hard) {
            fs.emptyDirSync(targetPath);
            console.log('Directory cleared');
            createWorkspace(targetPath, options.demo ? true : false);
        } else {
            fs.readdir(targetPath, (err, files) => {
                if (!err) {
                    if (!options.hard && files.length > 0) {
                        console.log('Directory not empty, try clean it manually or add -h option');
                    } else {
                        createWorkspace(targetPath, options.demo ? true : false);
                    }
                }
            });
        }
    });

program.command('help <cmd>')
    .action((cmd) => {
        if (cmd === 'init') {
            console.log(`Create workspace for serverhub to run.\n    use -h, --hard to create workspace even when directory not empty.\n    use -d, --demo to add demo files.`);
        } else if (cmd === 'help') {
            console.log(`Print the help message of any command.\n use serverhub-cli help <command>.`);
        }
    })
program.parse(process.argv);