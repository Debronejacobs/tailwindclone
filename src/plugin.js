import postcss from 'postcss'
import lightningcss from 'lightningcss'
import browserslist from 'browserslist'
import setupTrackingContext from './lib/setupTrackingContext'
import processTailwindFeatures from './processTailwindFeatures'
import { env } from './lib/sharedState'
import { findAtConfigPath } from './lib/findAtConfigPath'
import { handleImportAtRules } from './lib/handleImportAtRules'

module.exports = function tailwindcss(configOrPath) {
  return {
    postcssPlugin: 'tailwindcss',
    plugins: [
      env.DEBUG &&
        function (root) {
          console.log('\n')
          console.time('JIT TOTAL')
          return root
        },
      ...handleImportAtRules(),
      function (root, result) {
        // Use the path for the `@config` directive if it exists, otherwise use the
        // path for the file being processed
        configOrPath = findAtConfigPath(root, result) ?? configOrPath

        let context = setupTrackingContext(configOrPath)

        if (root.type === 'document') {
          let roots = root.nodes.filter((node) => node.type === 'root')

          for (const root of roots) {
            if (root.type === 'root') {
              processTailwindFeatures(context)(root, result)
            }
          }

          return
        }

        processTailwindFeatures(context)(root, result)
      },
      function lightningCssPlugin(_root, result) {
        let map = result.map ?? result.opts.map

        let intermediateResult = result.root.toResult()
        let intermediateMap = intermediateResult.map?.toJSON?.() ?? map

        try {
          let transformed = lightningcss.transform({
            filename: result.opts.from,
            code: Buffer.from(intermediateResult.css),
            minify: false,
            sourceMap: !!intermediateMap,
            inputSourceMap: JSON.stringify(intermediateMap),
            targets:
              typeof process !== 'undefined' && process.env.JEST_WORKER_ID
                ? { chrome: 111 << 16 }
                : lightningcss.browserslistToTargets(
                    browserslist(require('../package.json').browserslist)
                  ),
            drafts: {
              nesting: true,
              customMedia: true,
            },
          })

          let code = transformed.code.toString()

          // https://postcss.org/api/#sourcemapoptions
          if (intermediateMap && transformed.map != null) {
            let prev = transformed.map.toString()
            intermediateMap.prev = prev
          }

          result.root = postcss.parse(code, {
            ...result.opts,
            map: intermediateMap,
          })
        } catch (err) {
          if (err.source && typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
            let lines = err.source.split('\n')
            err = new Error(
              [
                'Error formatting using Lightning CSS:',
                '',
                ...[
                  '```css',
                  ...lines.slice(Math.max(err.loc.line - 3, 0), err.loc.line),
                  ' '.repeat(err.loc.column - 1) + '^-- ' + err.toString(),
                  ...lines.slice(err.loc.line, err.loc.line + 2),
                  '```',
                ],
              ].join('\n')
            )
          }

          if (Error.captureStackTrace) {
            Error.captureStackTrace(err, lightningCssPlugin)
          }
          throw err
        }
      },
      env.DEBUG &&
        function (root) {
          console.timeEnd('JIT TOTAL')
          console.log('\n')
          return root
        },
    ].filter(Boolean),
  }
}

module.exports.postcss = true
