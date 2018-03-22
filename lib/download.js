const path = require('path')
const clone = require('git-clone')
const rm = require('rimraf').sync
const ora = require('ora')

const config = require('../config')

module.exports = function (target) {
  target = path.join('.', target)

  return new Promise((resolve, reject) => {
    const spinner = ora(`the project template is being downloaded, the source address: ${config.url}`)
    spinner.start()
    clone(config.url, target, { clone: true }, (err) => {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        // delete the git info
        rm(path.resolve(target, '.git'))
        spinner.succeed()
        resolve(target)
      }
    })
  })
}