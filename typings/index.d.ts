import { Plugin } from 'rollup';

export interface RollupRawWasmOptions {
  /* determines if wasm files will be copied to output dir */
  copy?: boolean;
  /* determines loading to browser */
  loadToBrowser?: boolean;
  /* path to which files are output inside the  */
  publicPath?: string;
}
