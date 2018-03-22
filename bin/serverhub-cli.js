#!/usr/bin/env node

/**
 * Generator Library
 * 
 * Mao Yuyang, 2018
 * ServerHub CLI
 */


const commander = require('commander')
const config = require('../config')
const package = require('../package.json')

commander
  .version(package.version)
  .usage('<command> [options]')
  .command('init', 'create a new project')
  .parse(process.argv)