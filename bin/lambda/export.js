const fs       = require('fs')
const path     = require('path')
const yargs    = require('yargs')
const archiver = require('archiver')
const cli_progress  = require('cli-progress')

const rootdir = path.resolve(__dirname, "../../")

const options = yargs
  .option('env', {
    alias: 'e',
    description: 'Sets the environment',
    type: 'string',
  })
  .argv

  const getfiles = async (inputPaths) => {
    const files = []
  
    /** Normalize exclusions to absolute paths for easier comparison **/
    const exclusions = [
      'node_modules/@types',
      'node_modules/archiver',
      'node_modules/cli-progress',
      'node_modules/mocha',
      'node_modules/ts-morph',
      'node_modules/typescript',
      'node_modules/express',
      'node_modules/express-fileupload',
      'node_modules/express-useragent',
    ].map(p => path.resolve(p))
  
    const isExcluded = (filePath) => {
      return exclusions.some(excludedPath => filePath.startsWith(excludedPath))
    }
  
    const walk = async (dir) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const resolvedPath = path.resolve(fullPath)
        if (isExcluded(resolvedPath)) continue
  
        if (entry.isDirectory()) {
          await walk(fullPath)
        } else {
          if (fullPath.endsWith('.ts') || fullPath.endsWith('.MD')) {
            /** Exclude */
          } else {
            files.push(fullPath)
          }
        }
      }
    }
  
    for (const item of inputPaths) {
      const stats = await fs.promises.stat(item)
      if (stats.isDirectory()) {
        await walk(item)
      } else {
        if (!isExcluded(path.resolve(item))) {
          files.push(item)
        }
      }
    }
  
    return files
  }

const run = async () => {
  try {

    /** Generating the file name of the exported archived/zipped file */
    const curdate = (new Date(Date.now())).toISOString()
    const expfpath = `${rootdir}/aws_lambda/${curdate.replace(/:/g, '-')}.zip`
    const environment = options.env ?? 'production'

    const exportables = [
      `${rootdir}/node_modules`,
      `${rootdir}/dist`,
      `${rootdir}/index.mjs`,
      `${rootdir}/lambda.js`
    ]

    const output = fs.createWriteStream(expfpath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', (err) => {
      throw err
    })
    archive.pipe(output)

    const files = await getfiles(exportables)
    console.log(`Total files to export: ${files.length}`)

    const progress_bar = new cli_progress.SingleBar({
      format: 'Exporting {processed_bytes}...',
      hideCursor: true,
      barsize: 40
    })

    progress_bar.start(0, 0)


    archive.on('progress', ({ fs: fsProgress }) => {
      const processed_bytes = fsProgress.processedBytes
      const processedKB = (processed_bytes / 1024).toFixed(2)
      const processedMB = (processed_bytes / (1024 * 1024)).toFixed(2)
      progress_bar.update(fsProgress.processedBytes, {
        processed_bytes: `${processedMB} MB (${processedKB} KB)`
      })
    })

    for (let i = 0; i < files.length; i++) {
      const file_path = files[i]
      const relative_path = path.relative(process.cwd(), file_path)
      archive.file(file_path, { name: relative_path })
    }

    await archive.finalize()

    progress_bar.stop()
    console.log(`Zip file created: ${expfpath}`)
    
  } catch (error) {
    const stack = new Error().stack
    console.error(error)
  }
  
}

run()