/**
 * utif（phoboslab/UTIF.js）无官方类型，这里声明用到的最小 API。
 * encodeImage: RGBA 像素数据 → TIFF 文件 ArrayBuffer
 */
declare module 'utif' {
  const UTIF: {
    encodeImage(rgba: Uint8Array | ArrayBuffer, width: number, height: number, metadata?: unknown): ArrayBuffer
    decode(buffer: ArrayBuffer): Array<{ width: number; height: number; [key: string]: unknown }>
    toRGBA8(ifd: { [key: string]: unknown }): Uint8Array
  }
  export default UTIF
}
