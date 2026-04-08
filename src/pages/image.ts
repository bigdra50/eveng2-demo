import {
  type EvenAppBridge,
  RebuildPageContainer,
  TextContainerProperty,
  ImageContainerProperty,
  ImageRawDataUpdate,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { isClickEvent } from '../utils/events'
import { encode1bitBmp } from '../utils/bmp'

const IMG_W = 200
const IMG_H = 100

type PatternGenerator = (x: number, y: number) => boolean

function generateGradient(x: number, y: number): boolean {
  const threshold = (x / IMG_W) * IMG_H
  return y < threshold
}

function generateCheckerboard(x: number, y: number): boolean {
  const cellSize = 12
  return (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0
}

function generateCircle(x: number, y: number): boolean {
  const cx = IMG_W / 2
  const cy = IMG_H / 2
  const r = Math.min(IMG_W, IMG_H) / 2 - 4
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
  return dist <= r
}

function generateStripes(x: number): boolean {
  return x % 16 < 8
}

const PATTERNS: { name: string; gen: PatternGenerator }[] = [
  { name: 'Checkerboard', gen: generateCheckerboard },
  { name: 'Gradient', gen: generateGradient },
  { name: 'Circle', gen: generateCircle },
  { name: 'Stripes', gen: (x, _y) => generateStripes(x) },
]

function generateBmp(gen: PatternGenerator): Uint8Array {
  const pixels = new Uint8Array(IMG_W * IMG_H)
  for (let y = 0; y < IMG_H; y++) {
    for (let x = 0; x < IMG_W; x++) {
      pixels[y * IMG_W + x] = gen(x, y) ? 1 : 0
    }
  }
  return encode1bitBmp(IMG_W, IMG_H, pixels)
}

async function sendImage(
  bridge: EvenAppBridge,
  gen: PatternGenerator,
): Promise<string> {
  const bmp = generateBmp(gen)
  const result = await bridge.updateImageRawData(
    new ImageRawDataUpdate({
      containerID: 2,
      containerName: 'img',
      imageData: bmp,
    }),
  )
  return `${result} (${bmp.length}B BMP)`
}

export async function buildImagePage(bridge: EvenAppBridge): Promise<PageResult> {
  let patternIndex = 0

  const label = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 30,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: 1,
    containerName: 'label',
    content: `Image: ${PATTERNS[0].name} [Click] next`,
    isEventCapture: 1,
  })

  const image = new ImageContainerProperty({
    xPosition: 188,
    yPosition: 34,
    width: IMG_W,
    height: IMG_H,
    containerID: 2,
    containerName: 'img',
  })

  const info = new TextContainerProperty({
    xPosition: 0,
    yPosition: 140,
    width: 576,
    height: 148,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: 3,
    containerName: 'info',
    content: `1-bit BMP ${IMG_W}x${IMG_H}\nSending...\n\n[Double-click] back`,
    isEventCapture: 0,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 3,
    textObject: [label, info],
    imageObject: [image],
  })

  setTimeout(async () => {
    const result = await sendImage(bridge, PATTERNS[0].gen)
    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 3,
        containerName: 'info',
        content: `1-bit BMP ${IMG_W}x${IMG_H}\nResult: ${result}\n\n[Double-click] back`,
      }),
    )
  }, 1000)

  return {
    container,
    async onEvent(event) {
      if (!isClickEvent(event)) return

      patternIndex = (patternIndex + 1) % PATTERNS.length
      const pattern = PATTERNS[patternIndex]

      bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: 1,
          containerName: 'label',
          content: `Image: ${pattern.name} [Click] next`,
        }),
      )

      const result = await sendImage(bridge, pattern.gen)
      bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: 3,
          containerName: 'info',
          content: `1-bit BMP ${IMG_W}x${IMG_H}\nResult: ${result}\n\n[Double-click] back`,
        }),
      )
    },
  }
}
