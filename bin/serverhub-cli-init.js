#!/usr/bin/env node

/**
 * Generator Library
 * 
 * Mao Yuyang, 2018
 * ServerHub CLI
 */

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

const download = require('../lib/download')
const generator = require('../lib/generator')

commander
  .usage('<project-name> [options]')
  .option('-v, --specVersion [value]', 'specify the template version')
  .option('-f, --feature [value]', 'specify the template feature')
  .parse(process.argv)

const rootPath = process.cwd()
const rootName = path.basename(rootPath)
const projectName = commander.args[0]
const specifiedVersion = commander.specVersion
const feature = commander.feature

const versionPattern = /^[0-9]\.[0-9]\.[0-9]$/

let isError = false
let next

if (!projectName) {
  commander.help()
  return
}

// only one choice
if (specifiedVersion && feature) {
  console.log(logSymbols.error, chalk.red('can not specify version and feature at the same time'))
  return
}

if (specifiedVersion && !versionPattern.test(specifiedVersion)) {
  console.log(logSymbols.error, chalk.red('the version format is incorrect'))
  return
}

function updateRootName() {
  const files = fs.readdirSync(rootPath)
  const length = files.length
  // if some files in directory
  // we should judge whether the name is repeated
  if (length) {
    for (let i = 0; i < length; i++) {
      const filePath = path.resolve(rootPath, files[i])
      if (fs.statSync(filePath).isDirectory()) {
        const dirName = files[i]
        if (dirName.indexOf(projectName) !== -1) {
          console.log(logSymbols.error, chalk.red(`the ${projectName} folder is already exists`))
          isError = true
          return
        }
      }
    }
    next = Promise.resolve(projectName)
  } else if (rootName === projectName) {
    // if the directory is empty , and the parent folder name is the same as the project name
    // we shuold ask the user
    next = inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: 'the current directory is empty , and the parent folder name is the same as the project name , whether to create project directly in the current directory ?',
        type: 'confirm',
        default: true,
      }
    ]).then(answer => {
      return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
    })
  } else {
    next = Promise.resolve(projectName)
  }
}

function run() {
  updateRootName()

  if (isError) return

  next
    .then(projectRoot => {
      return download(projectRoot, specifiedVersion, feature).then(context => {
        return {
          name: projectName,
          root: projectRoot,
          downloadTemp: context.target,
          repo: context.repo
        }
      })
      .catch(err => {
        console.log(logSymbols.error, chalk.red(`download failed: ${err}`))
      })
    })
    .then(context => {
      return inquirer.prompt([
        {
          name: 'projectName',
          message: 'the name of project',
          default: context.name,
        },
        {
          name: 'projectVersion',
          message: 'the version of project',
          default: '0.0.1'
        },
        {
          name: 'projectDescription',
          message: 'the description of project',
          default: `A project named ${context.name}`,
        }
      ]).then(answser => {
        return {
          ...context,
          metadata: {
            ...answser
          }
        }
      })
    })
    .then(context => {
      return generator(context)
    })
    .then(context => {
      console.log(' ')
      console.log(logSymbols.success, chalk.green('create success :)'))
      if (context.repo.type === 'version') {
        console.log(chalk.green(`- cd ${context.root}/${context.repo.value}`))
      } else {
        console.log(chalk.green(`- cd ${context.root}`))
      }
      console.log(chalk.green(`- npm install`))
      console.log(chalk.green(`- npm run dev`))
      console.log(' ')
    })
    .catch(err => {
      console.log(logSymbols.error, chalk.red(`create failed: ${err}`))
    })
}

run()