import {
  CreateStartUpPageContainer,
  type EvenAppBridge,
  ListContainerProperty,
  ListItemContainerProperty,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import { navigateTo, type PageId, type PageResult } from '../navigator'

const MENU_ITEMS: { label: string; page: PageId }[] = [
  { label: 'Display', page: 'display' },
  { label: 'List', page: 'list' },
  { label: 'Image', page: 'image' },
  { label: 'Input Events', page: 'input' },
  { label: 'Audio (Mic)', page: 'audio' },
  { label: 'IMU Motion', page: 'imu' },
  { label: 'Storage (KVS)', page: 'storage' },
  { label: 'Device Info', page: 'device' },
  { label: 'GPS (Web API)', page: 'gps' },
]

export async function buildMenuPage(bridge: EvenAppBridge): Promise<PageResult> {
  const list = new ListContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 8,
    paddingLength: 4,
    containerID: 1,
    containerName: 'menu',
    isEventCapture: 1,
    itemContainer: new ListItemContainerProperty({
      itemCount: MENU_ITEMS.length,
      itemWidth: 560,
      isItemSelectBorderEn: 1,
      itemName: MENU_ITEMS.map((item) => item.label),
    }),
  })

  const container = new CreateStartUpPageContainer({
    containerTotalNum: 1,
    listObject: [list],
  })

  return {
    container,
    onEvent(event) {
      const listEvent = event.listEvent
      if (!listEvent) return
      if (listEvent.eventType !== OsEventTypeList.CLICK_EVENT && listEvent.eventType !== undefined)
        return

      const index = listEvent.currentSelectItemIndex
      if (index === undefined || index < 0 || index >= MENU_ITEMS.length) return
      navigateTo(bridge, MENU_ITEMS[index].page)
    },
  }
}
