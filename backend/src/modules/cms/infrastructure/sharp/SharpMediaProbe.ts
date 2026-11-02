import type { MediaProbe } from '../../application';

/** Reads pixel size from the image header; bytes that are not a decodable image give `undefined`. */
export class SharpMediaProbe implements MediaProbe {
  async dimensions(bytes: Uint8Array) {
    try {
      const { default: sharp } = await import('sharp');   // native module: loaded only when an image is uploaded
      const meta = await sharp(bytes, { failOn: 'error' }).metadata();
      return meta.width && meta.height ? { width: meta.width, height: meta.height } : undefined;
    } catch {
      return undefined;
    }
  }
}
