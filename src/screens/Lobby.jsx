import { useState } from 'react'
import { ref, set, get } from 'firebase/database'
import { db } from '../firebase'

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function Lobby({ onJoin }) {
  const [mode, setMode] = useState(null) // 'create' | 'join'
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
    } catch (e) {
      setError('Could not create room. Check your Firebase config.')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    const code = joinCode.trim()
    if (code.length !== 4) {
      setError('Enter a 4-digit room code.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const snap = await get(ref(db, `rooms/${code}`))
      if (!snap.exists()) {
        setError('Room not found. Ask the band leader for the code.')
        setBusy(false)
        return
      }
      onJoin({ roomCode: code, role: 'bandmate' })
    } catch (e) {
      setError('Could not reach server. Check your connection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center mb-2">
        <h1 className="text-white font-black text-3xl sm:text-5xl uppercase tracking-tight">
          Band Cue Board
        </h1>
        <p className="text-gray-500 text-sm mt-1 tracking-widest uppercase">Live</p>
      </div>

      {mode === null && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black text-xl uppercase tracking-wide rounded-2xl py-5 transition-colors"
            onPointerDown={() => setMode('create')}
          >
            Create Room
            <span className="block text-indigo-300 font-normal text-sm normal-case tracking-normal mt-0.5">
              I'm the band leader
            </span>
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-black text-xl uppercase tracking-wide rounded-2xl py-5 transition-colors"
            onPointerDown={() => setMode('join')}
          >
            Join Room
            <span className="block text-gray-400 font-normal text-sm normal-case tracking-normal mt-0.5">
              I'm a bandmate
            </span>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex flex-col gap-4 w-full max-w-xs items-center">
          <p className="text-gray-400 text-center text-sm">
            A 4-digit room code will be generated. Share it with your bandmates.
          </p>
          <button
            disabled={busy}
            onPointerDown={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-black text-xl uppercase tracking-wide rounded-2xl py-5 transition-colors"
          >
            {busy ? 'Creating…' : 'Create Room'}
          </button>
          <button
            onPointerDown={() => { setMode(null); setError('') }}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="flex flex-col gap-4 w-full max-w-xs items-center">
          <p className="text-gray-400 text-center text-sm">
            Enter the 4-digit code from your band leader.
          </p>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={4}
            placeholder="0000"
            value={joinCode}
            onChange={(e) => {
              setError('')
              setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full bg-gray-800 border-2 border-gray-600 focus:border-indigo-500 outline-none text-white font-black text-4xl text-center tracking-[0.5em] rounded-2xl py-4 transition-colors"
            autoFocus
          />
          <button
            disabled={busy || joinCode.length !== 4}
            onPointerDown={handleJoin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-black text-xl uppercase tracking-wide rounded-2xl py-5 transition-colors"
          >
            {busy ? 'Joining…' : 'Join Room'}
          </button>
          <button
            onPointerDown={() => { setMode(null); setJoinCode(''); setError('') }}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {error && (
        <p className="text-rose-400 text-sm text-center max-w-xs">{error}</p>
      )}
    </div>
  )
}
