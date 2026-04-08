import {
  type DeviceStatus,
  type EvenAppBridge,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'

export async function buildDevicePage(bridge: EvenAppBridge): Promise<PageResult> {
  const deviceInfo = await bridge.getDeviceInfo()
  const userInfo = await bridge.getUserInfo()

  let statusText = '(listening...)'

  function buildContent(): string {
    const model = deviceInfo?.model ?? 'N/A'
    const sn = deviceInfo?.sn ?? 'N/A'
    const uid = userInfo?.uid ?? 'N/A'
    const name = userInfo?.name || '(no name)'
    const country = userInfo?.country ?? 'N/A'
    const conn = deviceInfo?.status?.connectType ?? 'N/A'

    return `Device Info Demo\n━━━━━━━━━━━━━━━━━\nModel: ${model}\nSN: ${sn}\nConnection: ${conn}\n\nUser: ${name} (uid:${uid})\nCountry: ${country}\n\n${statusText}\n\n[Double-click] back`
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
    containerName: 'device',
    content: buildContent(),
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  const unsubStatus = bridge.onDeviceStatusChanged((status: DeviceStatus) => {
    const battery = status.batteryLevel ?? '?'
    const wearing = status.isWearing ? 'Yes' : 'No'
    const charging = status.isCharging ? 'Yes' : 'No'
    const inCase = status.isInCase ? 'Yes' : 'No'
    statusText = `Battery: ${battery}%\nWearing: ${wearing}\nCharging: ${charging}\nIn case: ${inCase}`

    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'device',
        content: buildContent(),
      }),
    )
  })

  return {
    container,
    cleanup() {
      unsubStatus()
    },
  }
}
