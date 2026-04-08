import {
  type EvenAppBridge,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'

const DISPLAY_CONTENT = [
  'G2 Display Demo\n━━━━━━━━━━━━━━━━\n576x288 px/eye\n4-bit greyscale (16 levels)\n\nUnicode chars:\n▲ ▶ ▼ ◀ ● ○\n╭──────╮\n│ box  │\n╰──────╯\n\nProgress: █████━━━━━ 50%\n\n[Click] update text\n[Double-click] back',

  'Dynamic Update Test\n━━━━━━━━━━━━━━━━━━━\nThis text was updated\nvia textContainerUpgrade()\nwithout full page rebuild.\n\nNo flicker on hardware!\n\n[Click] show first page\n[Double-click] back',
]

export async function buildDisplayPage(bridge: EvenAppBridge): Promise<PageResult> {
  let pageIndex = 0

  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 8,
    containerID: 1,
    containerName: 'display',
    content: DISPLAY_CONTENT[0],
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  return {
    container,
    onEvent(event) {
      const eventType = event.textEvent?.eventType
      if (eventType !== OsEventTypeList.CLICK_EVENT && eventType !== undefined) return

      pageIndex = (pageIndex + 1) % DISPLAY_CONTENT.length
      bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: 1,
          containerName: 'display',
          content: DISPLAY_CONTENT[pageIndex],
        }),
      )
    },
  }
}
