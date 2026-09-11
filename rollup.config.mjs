// rollup.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';


const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const commonPlugins = [typescript({
  filterRoot: currentDirectory,
  include: [
    './src/**/*.ts',
  ],
  compilerOptions: {
    rootDir: currentDirectory,
  },
  tsconfig: path.resolve(currentDirectory, './tsconfig.json'),
}), commonjs(), nodeResolve()];

export default {
  input: path.resolve(currentDirectory, './src/index.ts'),
  output: [
    {
      file: path.resolve(currentDirectory, './dist/index.js'),
      format: 'cjs',
    },
    {
      file: path.resolve(currentDirectory, './dist/index.min.js'),
      format: 'cjs',
      plugins: [ terser() ],
      sourcemap: true,
    },
  ],
  plugins: [...commonPlugins],
};
