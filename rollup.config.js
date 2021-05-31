// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';


const commonPlugins = [typescript(), commonjs(), nodeResolve()];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.min.js',
      format: 'cjs',
      plugins: [ terser() ],
    },
  ],
  plugins: [...commonPlugins],
};
