import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: ['fs/promises', 'crypto'],
  output: [
    {
      format: 'cjs',
      dir: './dist',
      exports: 'named',
      footer: 'module.exports = Object.assign(exports.default, exports);',
    },
  ],
  plugins: [typescript()],
};
