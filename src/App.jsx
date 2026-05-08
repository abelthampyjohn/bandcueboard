import { useState, useCallback } from 'react'

const CATEGORIES = [
  {
    name: 'Song Structure',
    color: 'indigo',
    tiles: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Solo', 'Outro'],
  },
  {
    name: 'Dynamics',
    color: 'amber',
    tiles: ['Build Up', 'Break Down', 'Soft / Quiet', 'Loud / Big'],
  },
  {
    name: 'Tempo',
    color: 'cyan',
    tiles: ['Slow Down', 'Hold Tempo', 'Speed Up'],
  },
  {
    name: 'Key Changes',
    color: 'violet',
    tiles: ['Key +1', 'Key -1', 'Key +2', 'Key -2'],
  },
  {
    name: 'Commands',
    color: 'rose',
    tiles: ['Repeat', 'Vamp', 'Tag Ending', 'Improv', 'Go / Start', 'Stop / End'],
  },
]

const COLOR_MAP = {
  indigo: {
    header: 'bg-indigo-900 text-indigo-200',
    tile: 'bg-indigo-800 hover:bg-indigo-700 text-white border-indigo-600',
    flash: 'bg-indigo-400 text-indigo-950',
    log: 'text-indigo-300',
  },
  amber: {
    header: 'bg-amber-900 text-amber-200',
    tile: 'bg-amber-800 hover:bg-amber-700 text-white border-amber-600',
    flash: 'bg-amber-400 text-amber-950',
    log: 'text-amber-300',
  },
  cyan: {
    header: 'bg-cyan-900 text-cyan-200',
    tile: 'bg-cyan-800 hover:bg-cyan-700 text-white border-cyan-600',
    flash: 'bg-cyan-400 text-cyan-950',
    log: 'text-cyan-300',
  },
  violet: {
    header: 'bg-violet-900 text-violet-200',
    tile: 'bg-violet-800 hover:bg-violet-700 text-white border-violet-600',
    flash: 'bg-violet-400 text-violet-950',
    log: 'text-violet-300',
  },
  rose: {
    header: 'bg-rose-900 text-rose-200',
    tile: 'bg-rose-800 hover:bg-rose-700 text-white border-rose-600',
    flash: 'bg-rose-400 text-rose-950',
    log: 'text-rose-300',
  },
}

function CueTile({ label, color, onTap }) {
  const [flashing, setFlashing] = useState(false)
  const c = COLOR_MAP[color]

  const handleTap = useCallback(() => {
    setFlashing(true)
    onTap(label, color)
    setTimeout(() => setFlashing(false), 400)
  }, [label, color, onTap])

  return (
    <button
      onPointerDown={handleTap}
      className={`
        flex items-center justify-center
        rounded-xl border-2 select-none cursor-pointer
        font-bold tracking-wide uppercase
        transition-all duration-75 active:scale-95
        text-xl sm:text-2xl lg:text-3xl
        min-h-[72px] sm:min-h-[88px]
        px-2 py-3
        ${flashing ? c.flash : c.tile}
      `}
      style={{ letterSpacing: '0.04em' }}
    >
      {label}
    </button>
  )
}

function CategorySection({ category, onTap }) {
  const c = COLOR_MAP[category.color]
  return (
    <div className="mb-3">
      <div className={`px-3 py-1 rounded-t-lg text-xs font-bold uppercase tracking-widest ${c.header} mb-1`}>
        {category.name}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))` }}
      >
        {category.tiles.map((tile) => (
          <CueTile key={tile} label={tile} color={category.color} onTap={onTap} />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [log, setLog] = useState([])

  const handleTap = useCallback((label, color) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLog((prev) => [{ label, color, ts }, ...prev].slice(0, 30))
  }, [])

  const lastEntry = log[0]

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col" style={{ userSelect: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <span className="text-white font-black text-lg sm:text-2xl tracking-tight uppercase">
          Band Cue Board
        </span>
        <span className="text-gray-500 text-xs sm:text-sm font-mono">LIVE</span>
      </div>

      {/* Tile grid — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-1">
        {CATEGORIES.map((cat) => (
          <CategorySection key={cat.name} category={cat} onTap={handleTap} />
        ))}
      </div>

      {/* Log bar */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-2 min-h-[52px] flex items-center gap-3">
        {lastEntry ? (
          <>
            <span className="text-gray-500 font-mono text-xs shrink-0">{lastEntry.ts}</span>
            <span
              className={`font-black text-xl sm:text-2xl uppercase tracking-wider ${COLOR_MAP[lastEntry.color].log}`}
            >
              ▶ {lastEntry.label}
            </span>
          </>
        ) : (
          <span className="text-gray-600 text-sm italic">Tap a cue to send…</span>
        )}
      </div>
    </div>
  )
}
