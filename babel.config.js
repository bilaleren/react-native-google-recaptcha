module.exports = function (api) {
  api.cache(true)

  /**
   * @type {import('@babel/core').TransformOptions}
   */
  const testConfig = {
    presets: [
      'module:metro-react-native-babel-preset'
    ]
  }

  /**
   * @type {import('@babel/core').TransformOptions}
   */
  const productionConfig = {
    presets: [
      '@babel/env',
      '@babel/typescript',
      '@babel/react'
    ],
    plugins: [
      [
        'babel-plugin-jsx-remove-data-test-id',
        {
          attributes: ['testID']
        }
      ]
    ]
  }

  return {
    env: {
      test: testConfig,
      production: productionConfig
    }
  }
}
