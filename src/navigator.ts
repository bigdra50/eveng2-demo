import {
  type CreateStartUpPageContainer,
  type EvenAppBridge,
  type EvenHubEvent,
  OsEventTypeList,
  type RebuildPageContainer,
} from '@evenrealities/even_hub_sdk'

export type PageId =
  | 'menu'
  | 'display'
  | 'list'
  | 'image'
  | 'input'
  | 'audio'
  | 'imu'
  | 'storage'
  | 'device'
  | 'gps'

export type PageResult = {
  container: CreateStartUpPageContainer | RebuildPageContainer
  onEvent?: (event: EvenHubEvent) => void
  cleanup?: () => void
}

type PageBuilder = (bridge: EvenAppBridge) => Promise<PageResult>

const pages = new Map<PageId, PageBuilder>()
let currentCleanup: (() => void) | undefined
let unsubEvent: (() => void) | undefined
let initialized = false

export function registerPage(id: PageId, builder: PageBuilder): void {
  pages.set(id, builder)
}

export async function navigateTo(bridge: EvenAppBridge, pageId: PageId): Promise<void> {
  currentCleanup?.()
  unsubEvent?.()

  const builder = pages.get(pageId)
  if (!builder) throw new Error(`Page not found: ${pageId}`)

  const result = await builder(bridge)
  currentCleanup = result.cleanup

  if (!initialized) {
    await bridge.createStartUpPageContainer(result.container as CreateStartUpPageContainer)
    initialized = true
  } else {
    await bridge.rebuildPageContainer(result.container as RebuildPageContainer)
  }

  unsubEvent = bridge.onEvenHubEvent((event) => {
    const textType = event.textEvent?.eventType
    const sysType = event.sysEvent?.eventType

    if (
      pageId !== 'menu' &&
      (textType === OsEventTypeList.DOUBLE_CLICK_EVENT ||
        sysType === OsEventTypeList.DOUBLE_CLICK_EVENT)
    ) {
      navigateTo(bridge, 'menu')
      return
    }

    result.onEvent?.(event)
  })
}
