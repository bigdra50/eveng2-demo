import { type EvenHubEvent, OsEventTypeList } from '@evenrealities/even_hub_sdk'

/**
 * G2実機ではクリックがsysEvent(eventType=undefined)で来る。
 * proto3のデフォルト値0=CLICK_EVENTが省略されるため。
 */
export function isClickEvent(event: EvenHubEvent): boolean {
  const t = event.textEvent?.eventType
  if (event.textEvent && (t === OsEventTypeList.CLICK_EVENT || t === undefined)) return true

  if (event.sysEvent) {
    const s = event.sysEvent.eventType
    if (s === OsEventTypeList.CLICK_EVENT || s === undefined) return true
  }

  const l = event.listEvent?.eventType
  if (event.listEvent && (l === OsEventTypeList.CLICK_EVENT || l === undefined)) return true

  return false
}

export function eventTypeName(eventType: number | undefined): string {
  if (eventType === undefined) return 'CLICK(0?)'
  const names: Record<number, string> = {
    [OsEventTypeList.CLICK_EVENT]: 'CLICK',
    [OsEventTypeList.SCROLL_TOP_EVENT]: 'SCROLL_TOP',
    [OsEventTypeList.SCROLL_BOTTOM_EVENT]: 'SCROLL_BOTTOM',
    [OsEventTypeList.DOUBLE_CLICK_EVENT]: 'DOUBLE_CLICK',
    [OsEventTypeList.FOREGROUND_ENTER_EVENT]: 'FG_ENTER',
    [OsEventTypeList.FOREGROUND_EXIT_EVENT]: 'FG_EXIT',
    [OsEventTypeList.ABNORMAL_EXIT_EVENT]: 'ABNORMAL_EXIT',
    [OsEventTypeList.SYSTEM_EXIT_EVENT]: 'SYS_EXIT',
    [OsEventTypeList.IMU_DATA_REPORT]: 'IMU_DATA',
  }
  return names[eventType] ?? `UNKNOWN(${eventType})`
}
