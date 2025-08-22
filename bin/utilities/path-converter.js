import * as path from 'path'

export const convert_src_to_dist = (params) => {
  const relative_path = path.relative(path.resolve(params.root_dir, ""), params.file_path)
  const output = 'dist' + relative_path.slice(3)
  return output.replace(/\.ts$/, '.js')
}