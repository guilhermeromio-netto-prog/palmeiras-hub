import { useEffect, useState } from 'react'
import { getRoomCode } from '../sync/identity'

/** Room code reativo a troca local / outra aba */
export function useRoomCodeState() {
  const [room, setRoom] = useState(() => getRoomCode())
  useEffect(() => {
    const onCustom = (e) => setRoom(e.detail || getRoomCode())
    const onStorage = (e) => {
      if (e.key === 'palmeiras-hub-room-v1') setRoom(getRoomCode())
    }
    window.addEventListener('palmeiras-hub-room', onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('palmeiras-hub-room', onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return room
}
