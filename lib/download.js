/**
 * Generator Library
 * 
 * Mao Yuyang, 2018
 * ServerHub CLI
 */

const path = require('path')
const fs = require('fs')
const download = require('download-git-repo')
const rm = require('rimraf').sync
const ora = require('ora')

const config = require('../config')

/**
 * Get repository
 * @param {string} version specified template version
 * @param {string} feature specified template feature
 */
function getRepository(version, feature) {
  if (version && feature) return

  let defaultRepository = config.repository
  let repository
  let type, value

  if (version) {
    repository = `${defaultRepository}#version`
    type = 'version'
    value = version
  }

  if (feature) {
    repository = `${defaultRepository}#feature-${feature}`
    type = 'feature'
    value = feature
  }

  return {
    repository: repository || defaultRepository,
    type,
    value
  }

}

/**
 * Check version and delete others
 * @param {object} repo 
 * @param {string} target
 */
function checkVersion(repo, target) {
  const files = fs.readdirSync(target)
  const length = files.length

  if (!files.includes(repo.value)) {
    rm(target)
    return false
  }

  for (let i = 0; i < length; i++) {
    if (files[i] !== repo.value) {
      const p = path.join(target, files[i])
      rm(p)
    } else {

    }
  }

  return true
}

/**
 * Download function
 * @param {string} target the destination of project
 * @param {string} version specified template version
 * @param {string} feature specified template feature
 */
module.exports = function (target, version, feature) {
  // only one choice
  if (version && feature) return

  const repo = getRepository(version, feature)
  target = path.join('.', target)
  
  return new Promise((resolve, reject) => {
    const spinner = ora(`the project template is being downloaded, the source repository: ${repo.repository}`)
    spinner.start()
    // download the repo rather than clone it
    download(repo.repository, target, { clone: false }, (err) => {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        switch (repo.type) {
          case 'version':
            if (checkVersion(repo, target)) {
              spinner.succeed()
              resolve({ repo, target })
            } else {
              spinner.fail()
              reject('the specified version does not exist')
            }
            break;
          case 'feature':
          default:
            spinner.succeed()
            resolve({ repo, target })
        }
      }
    })
  })
}