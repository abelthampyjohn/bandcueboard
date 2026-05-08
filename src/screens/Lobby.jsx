import { useState } from 'react'
import { ref, set, get } from 'firebase/database'
import { db } from '../firebase'

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function LogoMark() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="14" fill="url(#logo-grad)"/>
      {/* Grid of 3×2 tile squares */}
      <rect x="8"  y="8"  width="10" height="10" rx="2.5" fill="#818cf8" opacity="0.9"/>
      <rect x="21" y="8"  width="10" height="10" rx="2.5" fill="#818cf8" opacity="0.9"/>
      <rect x="34" y="8"  width="10" height="10" rx="2.5" fill="#818cf8" opacity="0.9"/>
      <rect x="8"  y="21" width="10" height="10" rx="2.5" fill="#fbbf24" opacity="0.9"/>
      <rect x="21" y="21" width="10" height="10" rx="2.5" fill="#22d3ee" opacity="0.9"/>
      <rect x="34" y="21" width="10" height="10" rx="2.5" fill="#a78bfa" opacity="0.9"/>
      {/* Flash tile */}
      <rect x="8"  y="34" width="10" height="10" rx="2.5" fill="#fb7185" opacity="0.9"/>
      <rect x="21" y="34" width="23" height="10" rx="2.5" fill="#fb7185" opacity="0.4"/>
      <polygon points="27,37 27,44 33,40.5" fill="#fb7185"/>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#312e81"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Lobby({ onJoin }) {
  const [mode, setMode] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setBusy(true)
    setError('')
    try {
      const code = randomCode()
      await set(ref(db, `rooms/${code}`), {
        createdAt: Date.now(),
        currentCue: null,
        tileNames: {},
      })
      onJoin({ roomCode: code, role: 'leader' })
    } catch {
      setError('Could not create room. Check your Firebase config.')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    const code = joinCode.trim()
    if (code.length !== 4) { setError('Enter a 4-digit room code.'); return }
    setBusy(true)
    setError('')
    try {
      const snap = await get(ref(db, `rooms/${code}`))
      if (!snap.exists()) {
        setError('Room not found. Ask your band leader for the code.')
        setBusy(false)
        return
      }
      onJoin({ roomCode: code, role: 'bandmate' })
    } catch {
      setError('Could not reach the server. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 safe-top safe-bottom"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #1e1b4b 0%, #090b0f 70%)',
        userSelect: 'none',
      }}
    >
      {/* Brand */}
      <div className="flex flex-col items-center gap-4">
        <LogoMark />
        <div className="text-center">
          <h1
            className="text-white uppercase"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 8vw, 4rem)',
              letterSpacing: '0.1em',
            }}
          >
            Band Cue Board
          </h1>
          <p className="text-indigo-400 text-xs tracking-[0.3em] uppercase mt-1 font-semibold">
            Live Performance
          </p>
        </div>
      </div>

      {/* Mode selector */}
      {mode === null && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onPointerDown={() => setMode('create')}
            className="group relative overflow-hidden rounded-2xl py-5 px-6 text-left transition-transform active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span className="block text-white text-2xl tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)' }}>Create Room</span>
            <span className="block text-indigo-300 text-sm font-medium mt-0.5">I'm the band leader</span>
          </button>

          <button
            onPointerDown={() => setMode('join')}
            className="rounded-2xl py-5 px-6 text-left transition-transform active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
              border: '1px solid #374151',
            }}
          >
            <span className="block text-white text-2xl tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)' }}>Join Room</span>
            <span className="block text-gray-400 text-sm font-medium mt-0.5">I'm a bandmate</span>
          </button>
        </div>
      )}

      {/* Create flow */}
      {mode === 'create' && (
        <div className="flex flex-col gap-4 w-full max-w-sm items-center">
          <div
            className="w-full rounded-2xl px-5 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              A 4-digit room code will be generated instantly.<br />
              Share it with your bandmates to connect.
            </p>
          </div>
          <button
            disabled={busy}
            onPointerDown={handleCreate}
            className="w-full rounded-2xl py-5 text-white text-2xl tracking-widest uppercase transition-transform active:scale-[0.97] disabled:opacity-50"
            style={{ fontFamily: 'var(--font-display)' }}
            style={{
              background: busy ? '#312e81' : 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
            }}
          >
            {busy ? 'Creating…' : 'Create Room'}
          </button>
          <button
            onPointerDown={() => { setMode(null); setError('') }}
            className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Join flow */}
      {mode === 'join' && (
        <div className="flex flex-col gap-4 w-full max-w-sm items-center">
          <p className="text-gray-500 text-sm text-center">
            Enter the 4-digit code from your band leader
          </p>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={4}
            placeholder="· · · ·"
            value={joinCode}
            onChange={(e) => {
              setError('')
              setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full text-white font-black text-5xl text-center tracking-[0.6em] rounded-2xl py-5 outline-none transition-all placeholder:text-gray-700"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '2px solid',
              borderColor: joinCode.length === 4 ? '#6366f1' : 'rgba(255,255,255,0.1)',
              boxShadow: joinCode.length === 4 ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
            }}
            autoFocus
          />
          <button
            disabled={busy || joinCode.length !== 4}
            onPointerDown={handleJoin}
            className="w-full rounded-2xl py-5 text-white text-2xl tracking-widest uppercase transition-transform active:scale-[0.97] disabled:opacity-40"
            style={{ fontFamily: 'var(--font-display)' }}
            style={{
              background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
              boxShadow: joinCode.length === 4 ? '0 4px 24px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {busy ? 'Joining…' : 'Join Room'}
          </button>
          <button
            onPointerDown={() => { setMode(null); setJoinCode(''); setError('') }}
            className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm text-center max-w-sm w-full"
          style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fda4af' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
