import { useState, useCallback, useEffect } from 'react'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../firebase'
import { CATEGORIES, COLOR_MAP, tileKey } from '../constants'
import CueTile from '../components/CueTile'

function CategorySection({ category, catIdx, tileNames, onTap }) {
  const c = COLOR_MAP[category.color]
  return (
    <div className="mb-4">
      {/* Category label */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: c.dot, boxShadow: `0 0 6px ${c.glow}` }}
        />
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: c.label }}
        >
          {category.name}
        </span>
        <span
          className="flex-1 h-px"
          style={{ background: `linear-gradient(to right, ${c.tileBorder}40, transparent)` }}
        />
      </div>

      {/* Tile grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
      >
        {category.tiles.map((defaultLabel, tileIdx) => {
          const key = tileKey(catIdx, tileIdx)
          const label = tileNames[key] ?? defaultLabel
          return (
            <CueTile
              key={key}
              label={label}
              color={category.color}
              onTap={onTap}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function LeaderBoard({ roomCode, onOpenSettings, onLeave }) {
  const [tileNames, setTileNames] = useState({})
  const [lastCue, setLastCue] = useState(null)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomCode}`)
    const unsub = onValue(roomRef, (snap) => {
      const data = snap.val()
      if (!data) return
      if (data.tileNames) setTileNames(data.tileNames)
      if (data.currentCue) setLastCue(data.currentCue)
    })
    return unsub
  }, [roomCode])

  const handleTap = useCallback((label, color) => {
    const cue = { label, color, ts: Date.now() }
    set(ref(db, `rooms/${roomCode}/currentCue`), cue)
    setLastCue(cue)
  }, [roomCode])

  function copyCode() {
    navigator.clipboard?.writeText(roomCode).catch(() => {})
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const lc = lastCue ? COLOR_MAP[lastCue.color] : null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#090b0f', userSelect: 'none' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 gap-3 safe-top safe-left safe-right"
        style={{
          background: 'linear-gradient(180deg, #111318 0%, #0d0f14 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <span
          className="text-white font-black shrink-0"
          style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', letterSpacing: '-0.01em' }}
        >
          Band Cue Board
        </span>

        <div className="flex items-center gap-2">
          {/* Room code */}
          <button
            onPointerDown={copyCode}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-opacity active:opacity-70"
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
            title="Tap to copy"
          >
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest hidden sm:inline">Room</span>
            <span className="text-white font-black text-lg tracking-[0.2em] font-mono">{roomCode}</span>
            <span className="text-xs" style={{ color: codeCopied ? '#4ade80' : '#6366f1' }}>
              {codeCopied ? '✓' : '⎘'}
            </span>
          </button>

          {/* Settings */}
          <button
            onPointerDown={onOpenSettings}
            className="rounded-xl px-3 py-1.5 text-gray-400 hover:text-white transition-colors text-base"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Settings"
          >
            ⚙
          </button>

          {/* Leave */}
          <button
            onPointerDown={onLeave}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-rose-400 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Scrollable tile grid */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1">
        {CATEGORIES.map((cat, catIdx) => (
          <CategorySection
            key={cat.name}
            category={cat}
            catIdx={catIdx}
            tileNames={tileNames}
            onTap={handleTap}
          />
        ))}
      </div>

      {/* Log bar */}
      <div
        className="shrink-0 px-4 py-3 min-h-[56px] flex items-center gap-3 safe-bottom safe-left safe-right"
        style={{
          background: 'linear-gradient(180deg, #0d0f14 0%, #111318 100%)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {lastCue ? (
          <>
            {/* Colour accent bar */}
            <span
              className="w-1 h-8 rounded-full shrink-0"
              style={{ background: lc ? `linear-gradient(to bottom, ${lc.flashFrom}, ${lc.flashTo})` : '#fff' }}
            />
            <div className="flex flex-col min-w-0">
              <span
                className="font-black uppercase leading-tight truncate"
                style={{ color: lc?.log, fontSize: 'clamp(1rem, 3vw, 1.4rem)', letterSpacing: '0.04em' }}
              >
                {lastCue.label}
              </span>
              <span className="text-gray-600 font-mono text-xs">
                {new Date(lastCue.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </>
        ) : (
          <span className="text-gray-700 text-sm italic">Tap a tile to fire a cue…</span>
        )}
      </div>
    </div>
  )
}
