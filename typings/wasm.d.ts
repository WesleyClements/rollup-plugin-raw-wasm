declare module '*.wasm' {
  export default (): Promise<Response> => {};
}
