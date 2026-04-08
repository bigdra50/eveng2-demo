import { initBridge } from './bridge'
import { navigateTo, registerPage } from './navigator'
import { buildAudioPage } from './pages/audio'
import { buildDevicePage } from './pages/device'
import { buildDisplayPage } from './pages/display'
import { buildGpsPage } from './pages/gps'
import { buildImagePage } from './pages/image'
import { buildImuPage } from './pages/imu'
import { buildInputPage } from './pages/input'
import { buildListPage } from './pages/list'
import { buildMenuPage } from './pages/menu'
import { buildStoragePage } from './pages/storage'

async function main() {
  const bridge = await initBridge()

  registerPage('menu', (b) => buildMenuPage(b))
  registerPage('display', (b) => buildDisplayPage(b))
  registerPage('list', (b) => buildListPage(b))
  registerPage('image', (b) => buildImagePage(b))
  registerPage('input', (b) => buildInputPage(b))
  registerPage('audio', (b) => buildAudioPage(b))
  registerPage('imu', (b) => buildImuPage(b))
  registerPage('storage', (b) => buildStoragePage(b))
  registerPage('device', (b) => buildDevicePage(b))
  registerPage('gps', (b) => buildGpsPage(b))

  await navigateTo(bridge, 'menu')
}

main()
