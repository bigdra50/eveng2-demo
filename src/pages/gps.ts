import {
  type EvenAppBridge,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { timestamp } from '../utils/format'

export async function buildGpsPage(bridge: EvenAppBridge): Promise<PageResult> {
  let watchId: number | undefined
  let tracking = false

  function buildContent(lat: string, lng: string, acc: string, status: string): string {
    return `GPS Demo (Web API)\n━━━━━━━━━━━━━━━━━━━\nTracking: ${tracking ? 'ON' : 'OFF'}\n\nLatitude:  ${lat}\nLongitude: ${lng}\nAccuracy:  ${acc}\n\nStatus: ${status}\n\n[Click] toggle tracking\n[Double-click] back`
  }

  const hasGeo = 'geolocation' in navigator
  const initialStatus = hasGeo ? 'Ready' : 'Geolocation API not available'

  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 8,
    containerID: 1,
    containerName: 'gps',
    content: buildContent('---', '---', '---', initialStatus),
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  function updateDisplay(lat: string, lng: string, acc: string, status: string) {
    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'gps',
        content: buildContent(lat, lng, acc, status),
      }),
    )
  }

  function startTracking() {
    if (!hasGeo) {
      updateDisplay('---', '---', '---', 'Not supported in this WebView')
      return
    }

    tracking = true
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        const acc = `${pos.coords.accuracy.toFixed(1)}m`
        updateDisplay(lat, lng, acc, `Updated ${timestamp()}`)
      },
      (err) => {
        const hint =
          err.code === err.PERMISSION_DENIED
            ? 'Host app does not grant\nlocation to WebView.\nRequires Even Realities App update.'
            : err.message
        updateDisplay('---', '---', '---', `${hint}`)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
    updateDisplay('---', '---', '---', 'Requesting location...')
  }

  function stopTracking() {
    tracking = false
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId)
      watchId = undefined
    }
    updateDisplay('---', '---', '---', 'Stopped')
  }

  return {
    container,
    onEvent(event) {
      const eventType = event.textEvent?.eventType
      if (eventType !== OsEventTypeList.CLICK_EVENT && eventType !== undefined) return

      if (tracking) {
        stopTracking()
      } else {
        startTracking()
      }
    },
    cleanup() {
      if (tracking) stopTracking()
    },
  }
}
