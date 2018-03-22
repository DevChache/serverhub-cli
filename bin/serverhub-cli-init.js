#!/usr/bin/env node

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

const download = require('../lib/download')
const generator = require('../lib/generator')

commander
  .usage('<project-name>')
  .parse(process.argv)

const rootPath = process.cwd()
let rootName = path.basename(rootPath)
let projectName = commander.args[0]
let isRepeat = false
let next

if (!projectName) {
  commander.help()
  return 
}

function updateRootName () {
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
          console.log(`the ${projectName} folder is already exists`)
          isRepeat = true
          return
        }
      }
    }
    next = Promise.resolve(projectName)
  } else if (rootName === projectName) {
    // if the directory is empty , and the parent folder is the same as the project name
    // we shuold ask the user
    next = inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: 'the current directory is empty , and the parent folder is the same as the project name , whether to create project directly in the current directory ?',
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

function run () {
  updateRootName()

  if (isRepeat) return

  next
    .then(projectRoot => {
      return download(projectRoot).then(target => {
        return {
          name: projectRoot,
          root: projectRoot,
          downloadTemp: target,
        }
      })
      .catch(err => console.log(err))
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
      return generator(context.metadata, context.root, context.downloadTemp)
    })
    .then(context => {
      console.log(logSymbols.success, chalk.green('create success :)'))
      console.log(chalk.green(`cd ${context.root}\nnpm install\nnpm run dev`))
    })
    .catch(err => {
      console.log(logSymbols.error, chalk.red(`create failed: ${err}`))
    })
}

run()