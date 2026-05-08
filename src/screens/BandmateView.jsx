import { useState, useEffect, useRef } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { COLOR_MAP } from '../constants'

export default function BandmateView({ roomCode, onLeave }) {
  const [cue, setCue] = useState(null)
  const [flashing, setFlashing] = useState(false)
  const lastTs = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const cueRef = ref(db, `rooms/${roomCode}/currentCue`)
    const unsub = onValue(cueRef, (snap) => {
      const data = snap.val()
      if (!data || data.ts === lastTs.current) return
      lastTs.current = data.ts
      setCue(data)

      // Flash
      clearTimeout(flashTimer.current)
      setFlashing(true)
      flashTimer.current = setTimeout(() => setFlashing(false), 600)
    })
    return () => {
      unsub()
      clearTimeout(flashTimer.current)
    }
  }, [roomCode])

  const c = cue ? COLOR_MAP[cue.color] : null

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative transition-colors duration-150 ${
        flashing && c ? c.bg : 'bg-gray-950'
      }`}
      style={{ userSelect: 'none' }}
    >
      {/* Subtle room code + leave */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4">
        <span className="text-gray-700 font-mono text-xs tracking-widest">#{roomCode}</span>
        <button
          onPointerDown={onLeave}
          className="text-gray-700 hover:text-gray-400 text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Main cue display */}
      {cue ? (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <span
            className={`font-black uppercase tracking-widest leading-none transition-colors duration-150 ${
              flashing ? 'text-gray-950' : c?.log ?? 'text-white'
            }`}
            style={{ fontSize: 'clamp(3rem, 15vw, 9rem)', letterSpacing: '0.06em' }}
          >
            {cue.label}
          </span>
          <span
            className={`uppercase tracking-[0.3em] text-sm font-bold transition-colors duration-150 ${
              flashing ? 'text-gray-800' : 'text-gray-600'
            }`}
          >
            {cue.color === 'indigo' ? 'Song Structure'
              : cue.color === 'amber' ? 'Dynamics'
              : cue.color === 'cyan' ? 'Tempo'
              : cue.color === 'violet' ? 'Key Changes'
              : 'Commands'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span className="text-gray-700 font-black text-4xl uppercase tracking-widest">
            Waiting…
          </span>
          <span className="text-gray-800 text-sm tracking-wider">
            Listening for cues from the leader
          </span>
        </div>
      )}

      {/* Heartbeat pulse ring when flashing */}
      {flashing && (
        <div
          className="absolute inset-0 pointer-events-none rounded-none"
          style={{ boxShadow: `inset 0 0 0 8px ${c?.flashBg ?? '#fff'}`, animation: 'none' }}
        />
      )}
    </div>
  )
}
