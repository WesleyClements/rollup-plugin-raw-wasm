import fs from 'fs/promises';
import { createHash } from 'crypto';

import { Plugin } from 'rollup';

export interface RollupRawWasmOptions {
  /* determines if wasm files will be copied to output dir */
  copy?: boolean;
  /* determines whether to use fetch to load */
  loadMethod?: 'fetch';
  /* path to which files are output inside the  */
  publicPath?: string;
}

export function rawWasm(options: RollupRawWasmOptions = {}): Plugin {
  const { copy = true, loadMethod = 'fetch', publicPath = '/' } = options;

  if (loadMethod !== 'fetch') throw new Error('only fetch is currently supported');

  const files = new Map();

  return {
    name: 'raw-wasm',

    load: async function (id) {
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
      const path = /^\/$/.test(publicPath)
        ? publicPath
        : (/^\//.test(publicPath) ? '' : '/') + publicPath + (/\/$/.test(publicPath) ? '' : '/');
      files.set(id, {
        filename,
        sourceMap: sourceMapBuffer && {
          source: sourceMapBuffer,
          fileName: id.split('/').pop() + '.map',
        },
        buffer: fileBuffer,
      });
      if (!copy) return 'export default () => Promise.resolve(null)';
      switch (loadMethod) {
        case 'fetch': {
          return `export default () => fetch("${path}${filename}")`;
        }
        default: {
          throw new Error(loadMethod + ' is not a supported method for loading');
        }
      }
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
