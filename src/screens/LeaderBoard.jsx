import { useState, useCallback, useEffect } from 'react'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../firebase'
import { CATEGORIES, COLOR_MAP, tileKey } from '../constants'
import CueTile from '../components/CueTile'

function CategorySection({ category, catIdx, tileNames, onTap }) {
  const c = COLOR_MAP[category.color]
  return (
    <div className="mb-3">
      <div className={`px-3 py-1 rounded-t-lg text-xs font-bold uppercase tracking-widest ${c.header} mb-1`}>
        {category.name}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
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

  // Sync tile names and last cue from Firebase
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

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col" style={{ userSelect: 'none' }}>
      {/* Header — safe-area-left/right for notch, safe-area-top for status bar in standalone */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 shrink-0 gap-2 safe-top safe-left safe-right">
        <span className="text-white font-black text-base sm:text-xl tracking-tight uppercase shrink-0">
          Band Cue Board
        </span>

        <div className="flex items-center gap-2">
          {/* Room code badge */}
          <button
            onPointerDown={copyCode}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 transition-colors"
            title="Tap to copy room code"
          >
            <span className="text-gray-400 text-xs uppercase tracking-wider hidden sm:inline">Room</span>
            <span className="text-white font-black text-lg tracking-widest font-mono">{roomCode}</span>
            {codeCopied
              ? <span className="text-green-400 text-xs">✓</span>
              : <span className="text-gray-500 text-xs">⎘</span>
            }
          </button>

          {/* Settings */}
          <button
            onPointerDown={onOpenSettings}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
            title="Settings"
          >
            ⚙
          </button>

          {/* Leave */}
          <button
            onPointerDown={onLeave}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-400 hover:text-rose-400 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Tile grid */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-1">
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

      {/* Log bar — safe-area-bottom for iPhone home bar */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-2 min-h-[52px] flex items-center gap-3 safe-bottom safe-left safe-right">
        {lastCue ? (
          <>
            <span className="text-gray-500 font-mono text-xs shrink-0">
              {new Date(lastCue.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`font-black text-xl sm:text-2xl uppercase tracking-wider ${COLOR_MAP[lastCue.color]?.log}`}>
              ▶ {lastCue.label}
            </span>
          </>
        ) : (
          <span className="text-gray-600 text-sm italic">Tap a tile to send a cue…</span>
        )}
      </div>
    </div>
  )
}
