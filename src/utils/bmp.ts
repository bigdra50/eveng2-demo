/**
 * 1-bit monochrome BMP生成（Even G2互換）
 *
 * G2のupdateImageRawDataはBMPファイルバイナリを期待する。
 * 参考: EvenChess (github.com/dmyster145/EvenChess) の実装パターン
 */
export function encode1bitBmp(width: number, height: number, pixels: Uint8Array): Uint8Array {
  const rowBytes = Math.ceil(width / 8)
  const stride = (rowBytes + 3) & ~3 // 4byte alignment
  const pixelDataSize = stride * height
  const headerSize = 62 // 14 (file) + 40 (info) + 8 (color table: 2 entries)
  const fileSize = headerSize + pixelDataSize

  const buf = new Uint8Array(fileSize)
  const view = new DataView(buf.buffer)

  // --- File Header (14 bytes) ---
  buf[0] = 0x42 // 'B'
  buf[1] = 0x4d // 'M'
  view.setUint32(2, fileSize, true)
  view.setUint32(10, headerSize, true)

  // --- Info Header (40 bytes) ---
  view.setUint32(14, 40, true) // header size
  view.setInt32(18, width, true)
  view.setInt32(22, height, true) // positive = bottom-up
  view.setUint16(26, 1, true) // planes
  view.setUint16(28, 1, true) // bpp = 1
  view.setUint32(30, 0, true) // compression = none
  view.setUint32(34, pixelDataSize, true)
  view.setUint32(38, 2835, true) // x ppm
  view.setUint32(42, 2835, true) // y ppm
  view.setUint32(46, 2, true) // colors used
  view.setUint32(50, 2, true) // colors important

  // --- Color Table (8 bytes) ---
  // Color 0 = black (0,0,0,0)
  buf[54] = 0
  buf[55] = 0
  buf[56] = 0
  buf[57] = 0
  // Color 1 = white (255,255,255,0)
  buf[58] = 255
  buf[59] = 255
  buf[60] = 255
  buf[61] = 0

  // --- Pixel Data (bottom-up) ---
  for (let row = 0; row < height; row++) {
    const srcY = height - 1 - row // BMP is bottom-up
    const dstOffset = headerSize + row * stride

    for (let x = 0; x < width; x++) {
      const srcIdx = srcY * width + x
      if (pixels[srcIdx] > 0) {
        const byteIdx = dstOffset + Math.floor(x / 8)
        const bitIdx = 7 - (x % 8)
        buf[byteIdx] |= 1 << bitIdx
      }
    }
  }

  return buf
}
