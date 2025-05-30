/**
 * The bootstrap file is the main entry point for the Node.js application. It 
 * initializes essential components such as middleware, environment variables, 
 * and utilities required for the app to function. This file also creates and 
 * configures routers, dynamically linking them to their respective controllers 
 * or handler functions, ensuring a cohesive routing structure. By centralizing 
 * these processes, it provides a streamlined and maintainable startup flow.
 * 
 * After completing initialization, the bootstrap file starts the application 
 * server, setting it to listen on the designated port. It logs the startup 
 * status, indicating that the application is ready to handle incoming requests. 
 * This modular design ensures the application is fully prepared and provides a 
 * solid foundation for delivering its core functionality.
 */

import { Application } from "./application"

const yargs = require('yargs')
const path  = require('path')
const cors  = require('cors')
import * as fs from 'fs'
global.APP_ROOT = path.resolve(__dirname, '../../')

const createCommandOptions = () => {
  return yargs
  .option('env', {
    alias: 'e',
    description: 'Sets the environment',
    type: 'string',
  })
  .option('router', {
    alias: 'r',
    description: 'Sets the router framework',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    description: 'Sets the port',
    type: 'number',
  })
  .argv
}

const getEnvFilePath = (options) => {
  const env = options.env ?? 'test'
  switch (env) {
    case 'development':
      return '../../.development.env'
      break;
    case 'staging': 
      return '../../.staging.env'
      break;
    case 'production': 
      return '../../.env'
      break;
    default:
      return '../../.test.env'
      break;
  }
}

const getPort = () => {
  return options.port ?? 3000
}

const options = createCommandOptions()

/** Loads env file, depending on which environment is selected */
require('dotenv').config({ path: path.resolve(__dirname, getEnvFilePath(options)) })

/** Sets the port */
const port = getPort()

Application.boot()
Application.environment(options.env)
Application.root(global.APP_ROOT)

import '../bindings'


