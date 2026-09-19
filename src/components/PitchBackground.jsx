import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL
const BG_PITCH = `${BASE}brand/bg-pitch.png`
const BG_WEBM = `${BASE}brand/bg-stadium.webm`
const BG_MP4 = `${BASE}brand/bg-stadium.mp4`

/**
 * Full-bleed pitch backdrop: static poster + optional looping muted video.
 * Respects prefers-reduced-motion and Preferências “Vídeo de fundo”.
 * Pauses when the tab is hidden.
 */
export default function PitchBackground({ videoEnabled = true }) {
  const videoRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    if (mq.addEventListener) mq.addEventListener('change', sync)
    else mq.addListener?.(sync)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', sync)
      else mq.removeListener?.(sync)
    }
  }, [])

  const playVideo = Boolean(videoEnabled) && !reducedMotion

  useEffect(() => {
    const v = videoRef.current
    if (!v) return undefined

    if (!playVideo) {
      try {
        v.pause()
      } catch {
        /* ignore */
      }
      return undefined
    }

    const tryPlay = () => {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }

    const onVis = () => {
      if (document.hidden) {
        try {
          v.pause()
        } catch {
          /* ignore */
        }
      } else {
        tryPlay()
      }
    }

    tryPlay()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      try {
        v.pause()
      } catch {
        /* ignore */
      }
    }
  }, [playVideo])

  return (
    <div
      className={`pitch-bg${playVideo ? ' pitch-bg--has-video' : ''}`}
      aria-hidden="true"
      style={{ '--pitch-img': `url(${BG_PITCH})` }}
    >
      {playVideo ? (
        <video
          ref={videoRef}
          className="pitch-bg__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={BG_PITCH}
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={BG_WEBM} type="video/webm" />
          <source src={BG_MP4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  )
}
