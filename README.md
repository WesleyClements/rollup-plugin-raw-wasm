[npm]: https://img.shields.io/npm/v/@wesley-clements/rollup-plugin-raw-wasm
[npm-url]: https://www.npmjs.com/package/@wesley-clements/rollup-plugin-raw-wasm
[size]: https://packagephobia.now.sh/badge?p=@wesley-clements/rollup-plugin-raw-wasm
[size-url]: https://packagephobia.now.sh/result?p=@wesley-clements/rollup-plugin-raw-wasm

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# @wesley-clements/rollup-plugin-raw-wasm

A Rollup which allows loading `wasm` raw files. This is just [the official Rollup wasm plugin](https://github.com/rollup/plugins/tree/master/packages/wasm) but does not instaniate a WebAssembly module.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v8.0.0+) and Rollup v1.20.0+.

## Install

Using npm:

```console
npm install @wesley-clements/rollup-plugin-raw-wasm --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import { rawWasm } from '@wesley-clements/rollup-plugin-raw-wasm';

export default {
  ...
  plugins: [rawWasm()],
  ...
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `copy`

Type: `Boolean`<br>
Default: `true`

Determines whether the wasm files will be copied to the output folder.

### `loadMethod`

Type: `String`<br>
Default: `'fetch'`

Determines which method should be used to load. Possible values: `'fetch'`. **More methods to come**

### `publicPath`

Type: `String`<br>
Default: `''`

A string which will be added in front of filenames when they are not inlined but are copied.

[LICENSE (MIT)](/LICENSE)
