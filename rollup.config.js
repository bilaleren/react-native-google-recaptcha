import path from 'path'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-ts'
import externals from 'rollup-plugin-node-externals'

const distDir = path.resolve(__dirname, 'dist')
const sourceDir = path.resolve(__dirname, 'src')

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: path.join(sourceDir, 'index.ts'),
    output: {
      file: path.join(distDir, 'index.js'),
      format: 'es'
    },
    plugins: [
      externals({
        deps: true,
        peerDeps: true,
        devDeps: true
      }),
      typescript({
        transpiler: 'babel'
      })
    ]
  },
  {
    input: path.join(sourceDir, 'index.ts'),
    output: {
      file: path.join(distDir, 'index.d.ts'),
      format: 'es'
    },
    plugins: [dts.default()],
  }
]
