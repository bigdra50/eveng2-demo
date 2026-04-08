import {
  type EvenAppBridge,
  OsEventTypeList,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { timestamp } from '../utils/format'

const TEST_KEY = 'demo_counter'

export async function buildStoragePage(bridge: EvenAppBridge): Promise<PageResult> {
  const stored = await bridge.getLocalStorage(TEST_KEY)
  let counter = stored ? parseInt(stored, 10) || 0 : 0

  function buildContent(status: string): string {
    return `Storage (KVS) Demo\n━━━━━━━━━━━━━━━━━━━\nKey: "${TEST_KEY}"\nValue: ${counter}\nLast op: ${status}\n\n[Click] increment & save\n[Double-click] back`
  }

  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 8,
    containerID: 1,
    containerName: 'storage',
    content: buildContent(`loaded at ${timestamp()}`),
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  return {
    container,
    async onEvent(event) {
      const eventType = event.textEvent?.eventType
      if (eventType !== OsEventTypeList.CLICK_EVENT && eventType !== undefined) return

      counter++
      const ok = await bridge.setLocalStorage(TEST_KEY, String(counter))
      const status = ok ? `saved ${counter} at ${timestamp()}` : `FAILED at ${timestamp()}`

      bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: 1,
          containerName: 'storage',
          content: buildContent(status),
        }),
      )
    },
  }
}
