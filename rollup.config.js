import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

export default {
  input: "src/index.ts",
  output: [
    {
      format: 'cjs',
      file: pkg.main,
      exports: 'named',
      footer: 'module.exports = Object.assign(exports.default, exports);'
    },
    {
      format: 'esm',
      file: pkg.module
    }
  ],
  plugins: [typescript()]
};
