import defaultConfig from '../../stubs/defaultConfig.stub.js'
import { flagEnabled } from '../featureFlags'

export default function getAllConfigs(config, depth = 0) {
  const presets = config?.presets ?? (depth > 0 ? [] : [defaultConfig])
  const configs = presets
    .slice()
    .reverse()
    .flatMap((preset) => getAllConfigs(preset instanceof Function ? preset() : preset, depth + 1))

  const features = {
    // Add experimental configs here...
  }

  const experimentals = Object.keys(features)
    .filter((feature) => flagEnabled(config, feature))
    .map((feature) => features[feature])

  return [config, ...experimentals, ...configs]
}
