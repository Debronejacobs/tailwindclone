export default function () {
  return function ({ matchUtilities2, theme, variants }) {
    let defaultTimingFunction = theme('transitionTimingFunction.DEFAULT')
    let defaultDuration = theme('transitionDuration.DEFAULT')

    matchUtilities2(
      {
        transition: (value) => {
          return {
            'transition-property': value,
            ...(value === 'none'
              ? {}
              : {
                  'transition-timing-function': defaultTimingFunction,
                  'transition-duration': defaultDuration,
                }),
          }
        },
      },
      {
        values: theme('transitionProperty'),
        variants: variants('transitionProperty'),
        type: 'lookup',
      }
    )
  }
}
