// rollup.config.js
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';


const commonPlugins = [typescript({
  include: [
    './src/**/*.ts',
  ],
  tsconfig: path.resolve(__dirname, './tsconfig.json'),
  useTsconfigDeclarationDir: true,
}), commonjs(), nodeResolve()];

export default {
  input: path.resolve(__dirname, './src/index.ts'),
  output: [
    {
      file: path.resolve(__dirname, './dist/index.js'),
      format: 'cjs',
    },
    {
      file: path.resolve(__dirname, './dist/index.min.js'),
      format: 'cjs',
      plugins: [ terser() ],
      sourcemap: true,
    },
  ],
  plugins: [...commonPlugins],
};
