import {
  type EvenAppBridge,
  EventSourceType,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { eventTypeName } from '../utils/events'
import { timestamp } from '../utils/format'

const SOURCE_NAMES: Record<number, string> = {
  [EventSourceType.TOUCH_EVENT_FORM_DUMMY_NULL]: 'NULL',
  [EventSourceType.TOUCH_EVENT_FROM_GLASSES_R]: 'G2_R',
  [EventSourceType.TOUCH_EVENT_FROM_RING]: 'RING',
  [EventSourceType.TOUCH_EVENT_FROM_GLASSES_L]: 'G2_L',
}

const MAX_LOG_LINES = 9

export async function buildInputPage(bridge: EvenAppBridge): Promise<PageResult> {
  const logs: string[] = []

  const log = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 4,
    containerID: 1,
    containerName: 'log',
    content: 'Input Events [Double-click=back]\nWaiting...',
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [log],
  })

  function addLog(entry: string) {
    logs.push(entry)
    if (logs.length > MAX_LOG_LINES) logs.shift()
    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'log',
        content: logs.join('\n'),
      }),
    )
  }

  return {
    container,
    onEvent(event) {
      const ts = timestamp()

      if (event.textEvent) {
        const t = event.textEvent
        addLog(`${ts} TEXT ${eventTypeName(t.eventType)}`)
      }

      if (event.listEvent) {
        const l = event.listEvent
        addLog(`${ts} LIST ${eventTypeName(l.eventType)} #${l.currentSelectItemIndex}`)
      }

      if (event.sysEvent) {
        const s = event.sysEvent
        const src = SOURCE_NAMES[s.eventSource ?? -1] ?? `src=${s.eventSource}`
        const imu = s.imuData
          ? ` xyz=${s.imuData.x?.toFixed(1)},${s.imuData.y?.toFixed(1)},${s.imuData.z?.toFixed(1)}`
          : ''
        addLog(`${ts} SYS ${eventTypeName(s.eventType)} ${src}${imu}`)
      }

      if (event.audioEvent) {
        addLog(`${ts} AUDIO ${event.audioEvent.audioPcm.length}B`)
      }

      // 全イベント型がnullの場合、raw JSONを表示
      if (!event.textEvent && !event.listEvent && !event.sysEvent && !event.audioEvent) {
        const raw = JSON.stringify(event.jsonData ?? event).slice(0, 60)
        addLog(`${ts} RAW ${raw}`)
      }
    },
  }
}
