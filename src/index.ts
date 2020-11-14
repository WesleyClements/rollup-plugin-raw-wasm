import fs from 'fs/promises';
import { createHash } from 'crypto';

import { Plugin } from 'rollup';

import { RollupRawWasmOptions } from '../typings';

export function wasm(options: RollupRawWasmOptions = {}): Plugin {
  const { copy = true, loadToBrowser = true, publicPath = '' } = options;

  if (!loadToBrowser)
    throw new Error('loading to platforms other than the browser is not supported');

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
      const path =
        (/^\//.test(publicPath) ? '' : '/') + publicPath + (/\/$/.test(publicPath) ? '' : '/');
      files.set(id, {
        filename,
        sourceMap: sourceMapBuffer && {
          source: sourceMapBuffer,
          fileName: id.split('/').pop() + '.map',
        },
        buffer: fileBuffer,
      });
      if (!copy) return 'export default () => Promise.resolve(null)';
      if (loadToBrowser) return `export default () => fetch("${path}${filename}")`;
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

export default wasm;
