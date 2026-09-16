import { useState } from 'react'
import { shareOrWhatsApp } from '../utils/share'

export default function ShareButton({ text, label = 'Compartilhar', className = '' }) {
  const [busy, setBusy] = useState(false)

  async function onShare(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!text || busy) return
    setBusy(true)
    try {
      await shareOrWhatsApp(text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`btn share-btn touch ${className}`.trim()}
      onClick={onShare}
      disabled={busy || !text}
      aria-label={label}
    >
      <span aria-hidden="true">📲</span> {busy ? 'Abrindo…' : label}
    </button>
  )
}
