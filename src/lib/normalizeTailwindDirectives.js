import log from '../util/log'

export default function normalizeTailwindDirectives(root) {
  const tailwindDirectives = new Set()
  const layerDirectives = new Set()
  const applyDirectives = new Set()

  root.walkAtRules((atRule) => {
    if (atRule.name === 'apply') {
      applyDirectives.add(atRule)
    }

    if (atRule.name === 'tailwind') {
      if (atRule.params === 'screens') {
        atRule.params = 'variants'
      }
      tailwindDirectives.add(atRule.params)
    }

    if (['layer', 'responsive', 'variants'].includes(atRule.name)) {
      if (['responsive', 'variants'].includes(atRule.name)) {
        log.warn(`${atRule.name}-at-rule-deprecated`, [
          `The \`@${atRule.name}\` directive has been deprecated in Tailwind CSS v3.0.`,
          `Use \`@layer utilities\` or \`@layer components\` instead.`,
          'https://tailwindcss.com/docs/upgrade-guide#replace-variants-with-layer',
        ])
      }
      layerDirectives.add(atRule)
    }
  })

  if (
    !tailwindDirectives.has('base') ||
    !tailwindDirectives.has('components') ||
    !tailwindDirectives.has('utilities')
  ) {
    for (const rule of layerDirectives) {
      if (rule.name === 'layer' && ['base', 'components', 'utilities'].includes(rule.params)) {
        if (!tailwindDirectives.has(rule.params)) {
          throw rule.error(
            `\`@layer ${rule.params}\` is used but no matching \`@tailwind ${rule.params}\` directive is present.`
          )
        }
      } else if (rule.name === 'responsive') {
        if (!tailwindDirectives.has('utilities')) {
          throw rule.error('`@responsive` is used but `@tailwind utilities` is missing.')
        }
      } else if (rule.name === 'variants') {
        if (!tailwindDirectives.has('utilities')) {
          throw rule.error('`@variants` is used but `@tailwind utilities` is missing.')
        }
      }
    }
  }

  return { tailwindDirectives, applyDirectives }
}
