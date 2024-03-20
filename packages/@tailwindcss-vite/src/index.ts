import { IO, Parsing, scanFiles } from '@tailwindcss/oxide'
import { Features, transform } from 'lightningcss'
import path from 'path'
import { compile } from 'tailwindcss'
import type { Plugin, Update, ViteDevServer } from 'vite'

export default function tailwindcss(): Plugin[] {
  let server: ViteDevServer | null = null
  let candidates = new Set<string>()
  let cssModules = new Set<string>()
  let minify = false

  function isCssFile(id: string) {
    let [filename] = id.split('?', 2)
    let extension = path.extname(filename).slice(1)
    return extension === 'css'
  }

  // Trigger update to all css modules
  function updateCssModules() {
    // If we're building then we don't need to update anything
    if (!server) return

    let updates: Update[] = []
    for (let id of cssModules.values()) {
      let cssModule = server.moduleGraph.getModuleById(id)
      if (!cssModule) {
        // It is safe to remove the item here since we're iterating on a copy of
        // the values.
        cssModules.delete(id)
        continue
      }

      server.moduleGraph.invalidateModule(cssModule)
      updates.push({
        type: `${cssModule.type}-update`,
        path: cssModule.url,
        acceptedPath: cssModule.url,
        timestamp: Date.now(),
      })
    }

    if (updates.length > 0) {
      server.hot.send({ type: 'update', updates })
    }
  }

  function scan(src: string, extension: string) {
    let updated = false
    // Parse all candidates given the resolved files
    for (let candidate of scanFiles(
      [{ content: src, extension }],
      IO.Sequential | Parsing.Sequential,
    )) {
      // On an initial or full build, updated becomes true immediately so we
      // won't be making extra checks.
      if (!updated) {
        if (candidates.has(candidate)) continue
        updated = true
      }
      candidates.add(candidate)
    }
    return updated
  }

  function generateCss(css: string) {
    return compile(css).build(Array.from(candidates))
  }

  function generateOptimizedCss(css: string) {
    return optimizeCss(generateCss(css), { minify })
  }

  return [
    {
      // Step 1: Scan source files for candidates
      name: '@tailwindcss/vite:scan',
      enforce: 'pre',

      configureServer(_server) {
        server = _server
      },

      async configResolved(config) {
        minify = config.build.cssMinify !== false
      },

      // Scan index.html for candidates
      transformIndexHtml(html) {
        let updated = scan(html, 'html')

        // In dev mode, if the generated CSS contains a URL that causes the
        // browser to load a page (e.g. an URL to a missing image), triggering a
        // CSS update will cause an infinite loop. We only trigger if the
        // candidates have been updated.
        if (server && updated) {
          updateCssModules()
        }
      },

      // Scan all other files for candidates
      transform(src, id) {
        if (id.includes('/.vite/')) return
        let [filename] = id.split('?', 2)
        let extension = path.extname(filename).slice(1)
        if (extension === '' || extension === 'css') return

        scan(src, extension)

        if (server) {
          updateCssModules()
        }
      },
    },

    {
      // Step 2 (dev mode): Generate CSS
      name: '@tailwindcss/vite:generate:serve',
      apply: 'serve',

      async transform(src, id) {
        if (!isCssFile(id) || !src.includes('@tailwind')) return

        cssModules.add(id)

        // Wait until all other files have been processed, so we can extract all
        // candidates before generating CSS.
        await server?.waitForRequestsIdle(id)

        return { code: generateCss(src) }
      },
    },

    {
      // Step 2 (full build): Generate CSS
      name: '@tailwindcss/vite:generate:build',
      enforce: 'post',
      apply: 'build',
      generateBundle(_options, bundle) {
        for (let id in bundle) {
          let item = bundle[id]
          if (item.type !== 'asset') continue
          if (!isCssFile(id)) continue
          let rawSource = item.source
          let source =
            rawSource instanceof Uint8Array ? new TextDecoder().decode(rawSource) : rawSource

          if (source.includes('@tailwind')) {
            item.source = generateOptimizedCss(source)
          }
        }
      },
    },
  ] satisfies Plugin[]
}

function optimizeCss(
  input: string,
  { file = 'input.css', minify = false }: { file?: string; minify?: boolean } = {},
) {
  return transform({
    filename: file,
    code: Buffer.from(input),
    minify,
    sourceMap: false,
    drafts: {
      customMedia: true,
    },
    nonStandard: {
      deepSelectorCombinator: true,
    },
    include: Features.Nesting,
    exclude: Features.LogicalProperties,
    targets: {
      safari: (16 << 16) | (4 << 8),
    },
    errorRecovery: true,
  }).code.toString()
}
