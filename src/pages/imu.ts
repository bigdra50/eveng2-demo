import {
  type EvenAppBridge,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
  ImuReportPace,
} from '@evenrealities/even_hub_sdk'
import type { PageResult } from '../navigator'
import { isClickEvent } from '../utils/events'

const PACE_OPTIONS = [
  { label: '100ms', value: ImuReportPace.P100 },
  { label: '500ms', value: ImuReportPace.P500 },
  { label: '1000ms', value: ImuReportPace.P1000 },
]

export async function buildImuPage(bridge: EvenAppBridge): Promise<PageResult> {
  let imuOn = false
  let paceIndex = 0
  let sampleCount = 0
  let lastX = 0
  let lastY = 0
  let lastZ = 0

  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,
    borderWidth: 1,
    borderColor: 5,
    paddingLength: 8,
    containerID: 1,
    containerName: 'imu',
    content: `IMU Motion Demo\n━━━━━━━━━━━━━━━━\nIMU: OFF  Pace: ${PACE_OPTIONS[0].label}\nSamples: 0\n\nX: ---\nY: ---\nZ: ---\n\n[Click] toggle\n[Double-click] back`,
    isEventCapture: 1,
  })

  const container = new RebuildPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  })

  function updateDisplay() {
    const xStr = imuOn ? lastX.toFixed(3) : '---'
    const yStr = imuOn ? lastY.toFixed(3) : '---'
    const zStr = imuOn ? lastZ.toFixed(3) : '---'

    bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'imu',
        content: `IMU Motion Demo\n━━━━━━━━━━━━━━━━\nIMU: ${imuOn ? 'ON' : 'OFF'}  Pace: ${PACE_OPTIONS[paceIndex].label}\nSamples: ${sampleCount}\n\nX: ${xStr}\nY: ${yStr}\nZ: ${zStr}\n\n[Click] toggle\n[Double-click] back`,
      }),
    )
  }

  return {
    container,
    async onEvent(event) {
      if (event.sysEvent?.eventType === OsEventTypeList.IMU_DATA_REPORT) {
        const imu = event.sysEvent.imuData
        if (imu) {
          lastX = imu.x ?? 0
          lastY = imu.y ?? 0
          lastZ = imu.z ?? 0
          sampleCount++
          updateDisplay()
        }
        return
      }

      if (event.sysEvent?.imuData) {
        const imu = event.sysEvent.imuData
        lastX = imu.x ?? 0
        lastY = imu.y ?? 0
        lastZ = imu.z ?? 0
        sampleCount++
        updateDisplay()
        return
      }

      if (!isClickEvent(event)) return

      imuOn = !imuOn
      if (imuOn) {
        paceIndex = (paceIndex + 1) % PACE_OPTIONS.length
      }
      await bridge.imuControl(imuOn, PACE_OPTIONS[paceIndex].value)
      sampleCount = 0
      updateDisplay()
    },
    cleanup() {
      if (imuOn) {
        bridge.imuControl(false)
        imuOn = false
      }
    },
  }
}
