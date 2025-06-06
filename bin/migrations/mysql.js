require('../../dist/models')
const path    = require('path')
const run = require('../../dist/core/bin/migration/mysql')
run.run({
  rootdir: path.resolve(__dirname, "../../")
})
