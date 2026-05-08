import { useState, useEffect, useRef } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { COLOR_MAP } from '../constants'

const CATEGORY_NAMES = {
  indigo: 'Song Structure',
  amber:  'Dynamics',
  cyan:   'Tempo',
  violet: 'Key Changes',
  rose:   'Commands',
}

export default function BandmateView({ roomCode, onLeave }) {
  const [cue, setCue] = useState(null)
  const [flashing, setFlashing] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const lastTs = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const up   = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online',  up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online',  up)
      window.removeEventListener('offline', down)
    }
  }, [])

  useEffect(() => {
    const cueRef = ref(db, `rooms/${roomCode}/currentCue`)
    const unsub = onValue(cueRef, (snap) => {
      const data = snap.val()
      if (!data || data.ts === lastTs.current) return
      lastTs.current = data.ts
      setCue(data)

      clearTimeout(flashTimer.current)
      setFlashing(true)
      flashTimer.current = setTimeout(() => setFlashing(false), 700)
    })
    return () => {
      unsub()
      clearTimeout(flashTimer.current)
    }
  }, [roomCode])

  const c = cue ? COLOR_MAP[cue.color] : null

  const bgStyle = flashing && c
    ? {
        background: `radial-gradient(ellipse 120% 100% at 50% 50%, ${c.flashFrom} 0%, ${c.flashTo}88 50%, ${c.bandFrom} 100%)`,
      }
    : cue && c
    ? {
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${c.bandTo} 0%, ${c.bandFrom} 60%, #090b0f 100%)`,
      }
    : {
        background: '#090b0f',
      }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{ ...bgStyle, userSelect: 'none', transition: 'background 0.15s ease' }}
    >
      {/* Offline banner */}
      {!online && (
        <div
          className="absolute top-0 left-0 right-0 text-xs font-bold text-center py-2 tracking-widest uppercase z-10 safe-top"
          style={{ background: 'rgba(120,53,15,0.9)', color: '#fcd34d', backdropFilter: 'blur(8px)' }}
        >
          Offline — showing last cue
        </div>
      )}

      {/* Room code + leave — top corners */}
      <div
        className={`absolute left-0 right-0 flex items-center justify-between px-5 safe-left safe-right z-10 ${
          online ? 'top-0 pt-4 safe-top' : 'top-9'
        }`}
      >
        <span
          className="font-mono text-xs tracking-widest"
          style={{ color: flashing && c ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.2)' }}
        >
          #{roomCode}
        </span>
        <button
          onPointerDown={onLeave}
          className="text-xs font-bold uppercase tracking-wider transition-colors"
          style={{ color: flashing && c ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.2)' }}
        >
          Leave
        </button>
      </div>

      {/* Main display */}
      {cue ? (
        <div className="flex flex-col items-center gap-3 px-8 text-center">
          {/* Category pill */}
          <span
            className="text-xs font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full"
            style={{
              background: flashing && c ? 'rgba(0,0,0,0.2)' : `${c?.tileBorder}30`,
              color: flashing && c ? cue ? c.flashText : '#fff' : c?.label,
              border: `1px solid ${flashing && c ? 'rgba(0,0,0,0.15)' : `${c?.tileBorder}50`}`,
              transition: 'all 0.15s ease',
            }}
          >
            {CATEGORY_NAMES[cue.color]}
          </span>

          {/* Cue label — the hero */}
          <span
            className="uppercase leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(4rem, 18vw, 12rem)',
              letterSpacing: '0.06em',
              color: flashing && c ? c.flashText : '#ffffff',
              textShadow: flashing && c
                ? 'none'
                : c ? `0 0 80px ${c.glow}` : 'none',
              transition: 'color 0.12s ease, text-shadow 0.12s ease',
            }}
          >
            {cue.label}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <span
            className="uppercase"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.15)',
              fontSize: 'clamp(2rem, 6vw, 4rem)',
            }}
          >
            Waiting…
          </span>
          <span className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.1)' }}>
            Listening for cues from the leader
          </span>
        </div>
      )}

      {/* Flash border ring */}
      {flashing && c && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 6px ${c.flashBg}`,
            borderRadius: 0,
            transition: 'opacity 0.1s',
          }}
        />
      )}
    </div>
  )
}
