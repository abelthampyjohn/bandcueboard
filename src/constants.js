export const CATEGORIES = [
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

export const COLOR_MAP = {
  indigo: {
    header: 'bg-indigo-900 text-indigo-200',
    tile: 'bg-indigo-800 hover:bg-indigo-700 text-white border-indigo-600',
    flash: 'bg-indigo-400 text-indigo-950',
    log: 'text-indigo-300',
    bg: 'bg-indigo-500',
    accent: '#6366f1',
    flashBg: '#a5b4fc',
  },
  amber: {
    header: 'bg-amber-900 text-amber-200',
    tile: 'bg-amber-800 hover:bg-amber-700 text-white border-amber-600',
    flash: 'bg-amber-400 text-amber-950',
    log: 'text-amber-300',
    bg: 'bg-amber-500',
    accent: '#f59e0b',
    flashBg: '#fcd34d',
  },
  cyan: {
    header: 'bg-cyan-900 text-cyan-200',
    tile: 'bg-cyan-800 hover:bg-cyan-700 text-white border-cyan-600',
    flash: 'bg-cyan-400 text-cyan-950',
    log: 'text-cyan-300',
    bg: 'bg-cyan-500',
    accent: '#06b6d4',
    flashBg: '#67e8f9',
  },
  violet: {
    header: 'bg-violet-900 text-violet-200',
    tile: 'bg-violet-800 hover:bg-violet-700 text-white border-violet-600',
    flash: 'bg-violet-400 text-violet-950',
    log: 'text-violet-300',
    bg: 'bg-violet-500',
    accent: '#8b5cf6',
    flashBg: '#c4b5fd',
  },
  rose: {
    header: 'bg-rose-900 text-rose-200',
    tile: 'bg-rose-800 hover:bg-rose-700 text-white border-rose-600',
    flash: 'bg-rose-400 text-rose-950',
    log: 'text-rose-300',
    bg: 'bg-rose-500',
    accent: '#f43f5e',
    flashBg: '#fda4af',
  },
}

// Stable key for a tile used in Firebase and settings storage
export function tileKey(catIdx, tileIdx) {
  return `${catIdx}-${tileIdx}`
}
