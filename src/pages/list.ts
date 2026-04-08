import {
  type EvenAppBridge,
  ListContainerProperty,
  ListItemContainerProperty,
  OsEventTypeList,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'

const LIST_ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1} - Sample entry`)

export async function buildListPage(bridge: EvenAppBridge): Promise<PageResult> {
  const header = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 40,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: 1,
    containerName: 'header',
    content: 'List Demo (20 items) [Double-click] back',
    isEventCapture: 0,
  })

  const list = new ListContainerProperty({
    xPosition: 0,
    yPosition: 44,
    width: 576,
    height: 200,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 4,
    containerID: 2,
    containerName: 'list',
    isEventCapture: 1,
    itemContainer: new ListItemContainerProperty({
      itemCount: LIST_ITEMS.length,
      itemWidth: 560,
      isItemSelectBorderEn: 1,
      itemName: LIST_ITEMS,
    }),
  })

  const status = new TextContainerProperty({
    xPosition: 0,
    yPosition: 248,
    width: 576,
    height: 40,
    borderWidth: 0,
    borderColor: 0,
    paddingLength: 4,
    containerID: 3,
    containerName: 'status',
    content: 'Selected: (none)',
    isEventCapture: 0,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 3,
    textObject: [header, status],
    listObject: [list],
  })

  return {
    container,
    onEvent(event) {
      const listEvent = event.listEvent
      if (!listEvent) return
      if (listEvent.eventType !== OsEventTypeList.CLICK_EVENT && listEvent.eventType !== undefined)
        return

      const index = listEvent.currentSelectItemIndex ?? 0
      const name = listEvent.currentSelectItemName ?? LIST_ITEMS[index] ?? '?'
      bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: 3,
          containerName: 'status',
          content: `Selected: #${index + 1} "${name}"`,
        }),
      )
    },
  }
}
