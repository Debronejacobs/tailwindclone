// @ts-check

import fs from 'fs'
import path from 'path'
import { resolveDefaultConfigPath } from '../../util/resolveConfigPath.js'
import { createProcessor } from './plugin.js'

export async function build(args) {
  let input = args['--input']
  const shouldWatch = args['--watch']

  // TODO: Deprecate this in future versions
  if (!input && args['_'][1]) {
    console.error('[deprecation] Running tailwindcss without -i, please provide an input file.')
    input = args['--input'] = args['_'][1]
  }

  if (input && input !== '-' && !fs.existsSync((input = path.resolve(input)))) {
    console.error(`Specified input file ${args['--input']} does not exist.`)
    process.exit(9)
  }

  if (args['--config'] && !fs.existsSync((args['--config'] = path.resolve(args['--config'])))) {
    console.error(`Specified config file ${args['--config']} does not exist.`)
    process.exit(9)
  }

  if (args['--no-autoprefixer']) {
    console.error('[deprecation] The --no-autoprefixer flag is deprecated and has no effect.')
  }

  // TODO: Reference the @config path here if exists
  const configPath = args['--config'] ? args['--config'] : resolveDefaultConfigPath()

  const processor = await createProcessor(args, configPath)

  if (shouldWatch) {
    // Abort the watcher if stdin is closed to avoid zombie processes
    // You can disable this behavior with --watch=always
    if (args['--watch'] !== 'always') {
      process.stdin.on('end', () => process.exit(0))
    }

    process.stdin.resume()

    await processor.watch()
  } else {
    await processor.build().catch((e) => {
      console.error(e)
      process.exit(1)
    })
  }
}
