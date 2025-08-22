const EnvExtractor = require("../utilities/extract-envars-keys.js");
const fs   = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, "../../")
const keys = EnvExtractor.extractAppEnvKeys(`${srcDir}/src`);
const envObject = Object.create(null)
const environments = ['development', 'staging', 'production', 'test']
for (let i = 0; i < environments.length; i++) {
  const environment = environments[i]
  const envarjsonPath = `${srcDir}/vault/env.${environment}.json`
  let envObject = {} 
  if (fs.existsSync(envarjsonPath)) {
    envObject = JSON.parse(fs.readFileSync(envarjsonPath))
  }
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k]
    if (!(key in envObject)) {
      envObject[key] = null 
    }
  }
  const prettyJson = JSON.stringify(envObject, null, 2)
  fs.writeFileSync(envarjsonPath, prettyJson, 'utf8')
}
