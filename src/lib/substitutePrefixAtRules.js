import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../util/cloneNodes'

export default function(config) {
  return function (css) {
    const options = config()

    css.walkAtRules('prefix', atRule => {
      const prefix = _.trim(atRule.params, `'"`)

      atRule.walkRules(rule => {
        rule.selectors = rule.selectors.map(selector => `.${prefix}${selector.slice(1)}`)
      })

      atRule.before(cloneNodes(atRule.nodes))
      atRule.remove()
    })
  }
}
