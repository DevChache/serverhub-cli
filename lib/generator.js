/**
 * Generator Library
 * 
 * Mao Yuyang, 2018
 * ServerHub CLI
 */

const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const rm = require('rimraf').sync

// replace tempalte names
module.exports = function (ctx) {
  const metadata = ctx.metadata
  const src = ctx.root
  const dest = ctx.downloadTemp
  
  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => {
          const t = files[fileName].contents.toString()
          files[fileName].contents = new Buffer(Handlebars.compile(t)(meta))
        })
        done()
      })
      .build(err => {
        err ? reject(err) : resolve({ ...ctx })
      })
  })
}