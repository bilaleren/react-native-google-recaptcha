const typescript = require('rollup-plugin-ts')
const { default: dts } = require('rollup-plugin-dts')
const externals = require('rollup-plugin-node-externals')
/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const config = [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'es'
    },
    plugins: [
      externals({
        deps: true,
        devDeps: true,
        peerDeps: true
      }),
      typescript({
        transpiler: 'babel'
      })
    ]
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
]

export default config
