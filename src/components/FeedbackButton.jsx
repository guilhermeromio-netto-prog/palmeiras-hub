import { useState } from 'react'
import { SITE_URL, shareOrWhatsApp } from '../utils/share'

const NOTES_KEY = 'palmeiras-hub-feedback-notes-v1'

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes.slice(-20)))
  } catch {
    /* ignore */
  }
}

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  async function shareFeedback() {
    const body =
      (text.trim() || 'Olá Guilherme! Sugestão para o Palmeiras Hub:') +
      `\n\n(via ${SITE_URL})`
    await shareOrWhatsApp(body)
  }

  function saveLocal() {
    const note = text.trim()
    if (!note) return
    const notes = loadNotes()
    notes.push({ at: new Date().toISOString(), text: note })
    saveNotes(notes)
    setSaved(true)
    setText('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <button
        type="button"
        className="btn feedback-fab touch"
        onClick={() => setOpen(true)}
        aria-label="Faltou algo?"
      >
        Faltou algo?
      </button>
      {open && (
        <div className="prefs-overlay" role="dialog" aria-modal="true" aria-label="Feedback">
          <div className="prefs-sheet card">
            <header className="prefs-sheet__head">
              <h2>Faltou algo?</h2>
              <button
                type="button"
                className="btn ghost touch"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </header>
            <p className="lede tight">
              Deixe uma nota local neste aparelho ou compartilhe com Guilherme (WhatsApp / share do
              sistema — sem número fixo).
            </p>
            <textarea
              className="feedback-textarea"
              rows={4}
              placeholder="Ex.: queria ver… / bug na tabela…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="feedback-actions">
              <button type="button" className="btn touch" onClick={saveLocal} disabled={!text.trim()}>
                {saved ? 'Salvo ✓' : 'Salvar nota local'}
              </button>
              <button type="button" className="btn touch primary" onClick={shareFeedback}>
                Compartilhar / WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
