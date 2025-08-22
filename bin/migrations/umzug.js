const path = require('path')
const yargs = require('yargs')
const runner = require('../../dist/core/bin/migration/umzug')

const rootdir = path.resolve(__dirname, "../../")
const cwd = path.resolve(__dirname, '../../')

const options = yargs
  .option('env', {
    alias: 'e',
    description: 'Sets the environment',
    type: 'string',
  })
  .argv

runner.run({
  rootdir: rootdir,
  cwd: cwd,
  options: options
})



