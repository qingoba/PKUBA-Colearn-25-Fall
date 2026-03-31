// Minimal ambient declaration for tronweb to satisfy TypeScript strict mode.
// TronWeb does not publish an official @types package.
declare module "tronweb" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TronWeb: any;
  export default TronWeb;
}
