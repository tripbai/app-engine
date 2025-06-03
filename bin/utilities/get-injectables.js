import * as fs from 'fs'
import * as path from 'path'
import * as TsMorph from "ts-morph"

export function get_injectables(params){

  const project = new TsMorph.Project({
    tsConfigFilePath: params.ts_config_file_path
  })

  const results = []

  function walk(current_path) {
    const files = fs.readdirSync(current_path)

    for (const file of files) {
      const full_path = path.join(current_path, file)

      if (fs.statSync(full_path).isDirectory()) {
        if (file.endsWith('tests') || file.endsWith('test')) {

        } else {
          walk(full_path)
        }
        
      } else if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
        const source_file = project.addSourceFileAtPath(full_path)
        const classes = source_file.getClasses()

        for (const cls of classes) {
          const decorators = cls.getDecorators()
          const has_injectable = decorators.some(decorator => decorator.getName() === "injectable")

          if (has_injectable && cls.isExported()) {
            results.push({
              class_name: cls.getName(),
              file_path: full_path.replace(/\\/g, "/"), 
            })
          }
        }
      }
    }
  }
  
  walk(params.from_dir)
  return results

}