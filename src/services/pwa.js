import { registerSW } from 'virtual:pwa-register'

let _updateSW = null
let _onUpdateCb = null
let _deferredPrompt = null

export function initPWA() {
  // Register service worker; prompt user before applying updates
  _updateSW = registerSW({
    onNeedRefresh() {
      _onUpdateCb?.()
    },
    onOfflineReady() {
      console.info('App ready to work offline')
    },
  })

  // Capture the install prompt for Chromium browsers
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferredPrompt = e
  })
}

export function onUpdateAvailable(cb) {
  _onUpdateCb = cb
}

export async function applyUpdate() {
  await _updateSW?.(true)
}

export async function promptInstall() {
  if (!_deferredPrompt) return false
  _deferredPrompt.prompt()
  const { outcome } = await _deferredPrompt.userChoice
  _deferredPrompt = null
  return outcome === 'accepted'
}

export function canInstall() {
  return _deferredPrompt !== null
}
