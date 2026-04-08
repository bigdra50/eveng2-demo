import {
  type EvenAppBridge,
  OsEventTypeList,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { timestamp } from '../utils/format'

export async function buildAudioPage(bridge: EvenAppBridge): Promise<PageResult> {
  let micOn = false
  let totalBytes = 0

  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 8,
    containerID: 1,
    containerName: 'audio',
    content:
      'Audio (Mic) Demo\n━━━━━━━━━━━━━━━━\nMic: OFF\nFormat: PCM 16kHz mono 16bit\nTotal received: 0 bytes\n\n[Click] toggle mic\n[Double-click] back',
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  function updateDisplay() {
    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'audio',
        content: `Audio (Mic) Demo\n━━━━━━━━━━━━━━━━\nMic: ${micOn ? 'ON' : 'OFF'}\nFormat: PCM 16kHz mono 16bit\nTotal received: ${totalBytes} bytes\nLast update: ${timestamp()}\n\n[Click] toggle mic\n[Double-click] back`,
      }),
    )
  }

  return {
    container,
    async onEvent(event) {
      if (event.audioEvent) {
        totalBytes += event.audioEvent.audioPcm.length
        updateDisplay()
        return
      }

      const eventType = event.textEvent?.eventType
      if (eventType !== OsEventTypeList.CLICK_EVENT && eventType !== undefined) return

      micOn = !micOn
      await bridge.audioControl(micOn)
      updateDisplay()
    },
    cleanup() {
      if (micOn) {
        bridge.audioControl(false)
        micOn = false
      }
    },
  }
}
