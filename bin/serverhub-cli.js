#!/usr/bin/env node

const commander = require('commander')
const config = require('../config')
const package = require('../package.json')

commander
  .version(package.version)
  .usage('<command> [options]')
  .command('init', 'create a new project')
  .parse(process.argv)