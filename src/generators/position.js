import defineClasses from '../util/defineClasses'

export default function() {
  return defineClasses({
    static: { position: 'static' },
    fixed: { position: 'fixed' },
    absolute: { position: 'absolute' },
    relative: { position: 'relative' },
    sticky: { position: 'sticky' },
    'pin-none': {
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto',
    },
    pin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    'pin-y': { top: 0, bottom: 0 },
    'pin-x': { right: 0, left: 0 },
    'pin-t': { top: 0 },
    'pin-r': { right: 0 },
    'pin-b': { bottom: 0 },
    'pin-l': { left: 0 },
    'pin-t-full': { top: '100%' },
    'pin-r-full': { right: '100%' },
    'pin-b-full': { bottom: '100%' },
    'pin-l-full': { left: '100%' },
  })
}
