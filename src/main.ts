import { initBridge } from './bridge'
import { registerPage, navigateTo } from './navigator'
import { buildMenuPage } from './pages/menu'
import { buildDisplayPage } from './pages/display'
import { buildListPage } from './pages/list'
import { buildImagePage } from './pages/image'
import { buildInputPage } from './pages/input'
import { buildAudioPage } from './pages/audio'
import { buildImuPage } from './pages/imu'
import { buildStoragePage } from './pages/storage'
import { buildDevicePage } from './pages/device'
import { buildGpsPage } from './pages/gps'

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
