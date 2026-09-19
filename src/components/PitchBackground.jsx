import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL
const BG_VERDAO = `${BASE}brand/bg-verdao-3d.png`
const BG_PITCH = `${BASE}brand/bg-pitch.png`
const BG_WEBM = `${BASE}brand/bg-stadium.webm`
const BG_MP4 = `${BASE}brand/bg-stadium.mp4`
const PROP_JERSEY = `${BASE}brand/prop-jersey-3d.png`
const PROP_BALL = `${BASE}brand/prop-ball-3d.png`
const PROP_SHIELD = `${BASE}brand/prop-shield-3d.png`

/**
 * Full-bleed Verdão immersion: 3D jersey/ball/shield poster + optional looping muted video.
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
      className={`pitch-bg${playVideo ? ' pitch-bg--has-video' : ' pitch-bg--static-verdao'}`}
      aria-hidden="true"
      style={{
        '--pitch-img': `url(${BG_VERDAO}), url(${BG_PITCH})`,
        '--prop-jersey': `url(${PROP_JERSEY})`,
        '--prop-ball': `url(${PROP_BALL})`,
        '--prop-shield': `url(${PROP_SHIELD})`,
      }}
    >
      {playVideo ? (
        <>
          <video
            ref={videoRef}
            className="pitch-bg__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={BG_VERDAO}
            disablePictureInPicture
            disableRemotePlayback
          >
            <source src={BG_WEBM} type="video/webm" />
            <source src={BG_MP4} type="video/mp4" />
          </video>
          <div className="pitch-bg__props" aria-hidden="true">
            <span className="pitch-bg__prop pitch-bg__prop--jersey" />
            <span className="pitch-bg__prop pitch-bg__prop--ball" />
            <span className="pitch-bg__prop pitch-bg__prop--shield" />
          </div>
        </>
      ) : null}
    </div>
  )
}
