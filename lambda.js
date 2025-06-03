/**
 * This is an express server that wraps around index.mjs, 
 * which the entry point of AWS Lambda functions. 
 * This is created to simulate http requests that routes 
 * to a Lambda function instance.
 */

const express = require('express')
const app = express()
const port = 7390
const cors = require('cors')
const useragent = require('express-useragent')
const LambdaAdapter = require('./dist/core/services/lambda/lambda-adapter')
const { handler } = require('./index.mjs')

/** Adding middlewares */
app.use(cors())
app.use(require('express-fileupload')())
app.use(express.json())
app.use(useragent.express())

/** Catches all routes */
app.use((request, response)=>{
  const resourcePath  = LambdaAdapter.LambdaAdapter.uriToResourcePath(
    request.method,
    request.url
  )
  const event = LambdaAdapter.LambdaAdapter.requestToEvent(
    request.method,
    resourcePath,
    request.url,
    request
  )
  handler(event).then(handlerResponse => {
    response.status(handlerResponse.statusCode)
    response.send(handlerResponse.body)
  })
})

app.listen(port, () => {
  console.log(`Lambda Mock Server is listening on port ${port}`)
})