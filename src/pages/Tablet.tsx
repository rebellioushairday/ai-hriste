import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { SITE_URL } from '../links.ts'

const displayUrl = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')

export default function Tablet() {
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toString(SITE_URL, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 4,
      color: { dark: '#121526', light: '#ffffff' },
    }).then((svg) => {
      if (!cancelled) setQr('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Ať tablet u stánku nezhasne obrazovku
  useEffect(() => {
    type WakeLock = { release: () => Promise<void> }
    type WakeLockApi = { request: (type: 'screen') => Promise<WakeLock> }
    const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock
    if (!api) return
    let lock: WakeLock | null = null
    const acquire = () => {
      if (document.visibilityState !== 'visible') return
      api
        .request('screen')
        .then((l) => {
          lock = l
        })
        .catch(() => {})
    }
    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      document.removeEventListener('visibilitychange', acquire)
      void lock?.release().catch(() => {})
    }
  }, [])

  return (
    <main className="tablet">
      <img className="tablet__logo" src="/logo-prg-ai.svg" alt="prg.ai" width={483} height={122} />
      <div className="tablet__body">
        <div className="tablet__text">
          <h1 tabIndex={-1}>Zkraťte si čekání</h1>
          <p>Naskenujte kód a zahrajte si</p>
        </div>
        <figure className="tablet__qr">
          {qr ? (
            <img src={qr} alt={`QR kód s odkazem na ${displayUrl}`} width={600} height={600} />
          ) : (
            <div className="tablet__qr-placeholder" />
          )}
          <figcaption>{displayUrl}</figcaption>
        </figure>
      </div>
    </main>
  )
}
