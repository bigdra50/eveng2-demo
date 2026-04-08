import { type EvenAppBridge, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'

let bridge: EvenAppBridge | undefined

export async function initBridge(): Promise<EvenAppBridge> {
  bridge = await waitForEvenAppBridge()
  return bridge
}

export function getBridge(): EvenAppBridge {
  if (!bridge) throw new Error('Bridge not initialized')
  return bridge
}
