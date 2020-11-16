import fs from 'fs/promises';
import { createHash } from 'crypto';

import { Plugin } from 'rollup';

export interface RollupRawWasmOptions {
  /* determines if wasm files will be copied to output dir */
  copy?: boolean;
  /* path to which files are output inside the  */
  publicPath?: string;
}

const LOADER_ID = '\0rawWasmLoader.js';
const loader = `export function __resolvePath(filePath) {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  if (isNode) {
    const path = require('path');
    return path.resolve(__dirname, filePath);
  } else return '/' + filePath;
}`;
export function rawWasm(options: RollupRawWasmOptions = {}): Plugin {
  const { copy = true, publicPath = '/' } = options;

  const files = new Map();

  return {
    name: 'raw-wasm',
    resolveId(id) {
      return id === LOADER_ID ? id : null;
    },

    load: async function (id) {
      if (id === LOADER_ID) {
        return loader;
      }
      if (!/\.wasm$/.test(id)) {
        return null;
      }
      const [fileBuffer, sourceMapBuffer] = await Promise.allSettled([
        fs.readFile(id),
        fs.readFile(id + '.map'),
      ]).then((results) =>
        results.map((result) => (result.status == 'fulfilled' ? result.value : null))
      );
      if (!fileBuffer) throw new Error('failed tp load file ' + id);
      const hash = createHash('sha1').update(fileBuffer).digest('hex').substr(0, 16);
      const filename = `${hash}.wasm`;
      const path =
        publicPath.substring(/^\//.test(publicPath) ? 1 : 0) + /\/$/.test(publicPath) ? '' : '/';
      files.set(id, {
        filename,
        sourceMap: sourceMapBuffer && {
          source: sourceMapBuffer,
          fileName: id.split('/').pop() + '.map',
        },
        buffer: fileBuffer,
      });
      return `import {__resolvePath} from ${JSON.stringify(
        LOADER_ID
      )};export default __resolvePath('${path}${filename}')`;
    },
    generateBundle: async function () {
      if (!copy) return;
      await Promise.all(
        [...files.values()].map(async ({ filename, sourceMap, buffer }) => {
          this.emitFile({
            type: 'asset',
            source: buffer,
            name: 'Rollup WASM Asset',
            fileName: filename,
          });
          if (sourceMap)
            this.emitFile({
              type: 'asset',
              source: sourceMap.source,
              name: 'Rollup WASM Asset SourceMap',
              fileName: sourceMap.fileName,
            });
        })
      );
    },
  };
}

export default rawWasm;
