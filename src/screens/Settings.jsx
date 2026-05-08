import { useState, useEffect } from 'react'
import { ref, update, onValue } from 'firebase/database'
import { db } from '../firebase'
import { CATEGORIES, COLOR_MAP, tileKey } from '../constants'

export default function Settings({ roomCode, onClose }) {
  const [tileNames, setTileNames] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const namesRef = ref(db, `rooms/${roomCode}/tileNames`)
    const unsub = onValue(namesRef, (snap) => {
      setTileNames(snap.val() ?? {})
    })
    return unsub
  }, [roomCode])

  function startEdit(key, currentLabel) {
    setEditing({ key, value: currentLabel })
  }

  async function saveEdit() {
    if (!editing) return
    const trimmed = editing.value.trim()
    setSaving(true)
    try {
      await update(ref(db, `rooms/${roomCode}/tileNames`), {
        [editing.key]: trimmed || null,
      })
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  async function resetTile(key) {
    await update(ref(db, `rooms/${roomCode}/tileNames`), { [key]: null })
  }

  async function resetAll() {
    await update(ref(db, `rooms/${roomCode}`), { tileNames: {} })
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#090b0f', userSelect: 'none' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 safe-top safe-left safe-right"
        style={{
          background: 'linear-gradient(180deg, #111318 0%, #0d0f14 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div>
          <span className="text-white font-black text-base tracking-tight">Rename Tiles</span>
          <span className="text-gray-600 text-xs ml-2">Tap any tile to edit</span>
        </div>
        <button
          onPointerDown={onClose}
          className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg text-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 safe-left safe-right">
        {CATEGORIES.map((cat, catIdx) => {
          const c = COLOR_MAP[cat.color]
          return (
            <div key={cat.name} className="mb-6">
              {/* Category label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: c.dot }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: c.label }}
                >
                  {cat.name}
                </span>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                {cat.tiles.map((defaultLabel, tileIdx) => {
                  const key = tileKey(catIdx, tileIdx)
                  const customLabel = tileNames[key]
                  const isEditing = editing?.key === key
                  const isLast = tileIdx === cat.tiles.length - 1

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {/* Default label */}
                      <span className="text-gray-600 text-sm w-28 shrink-0 font-medium">
                        {defaultLabel}
                      </span>

                      <span className="text-gray-800 text-xs shrink-0">→</span>

                      {/* Editable / display */}
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditing(null)
                          }}
                          className="flex-1 text-white font-bold text-sm rounded-lg px-3 py-1.5 outline-none uppercase tracking-wide"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: `1px solid ${c.tileBorder}`,
                            boxShadow: `0 0 0 3px ${c.glow}`,
                          }}
                          maxLength={20}
                        />
                      ) : (
                        <button
                          onPointerDown={() => startEdit(key, customLabel ?? defaultLabel)}
                          className="flex-1 text-left text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            color: customLabel ? c.tileText : 'rgba(255,255,255,0.3)',
                            background: customLabel ? `${c.tileFrom}` : 'transparent',
                            border: `1px solid ${customLabel ? c.tileBorder + '60' : 'transparent'}`,
                          }}
                        >
                          {customLabel ?? defaultLabel}
                        </button>
                      )}

                      {/* Actions */}
                      {isEditing ? (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            disabled={saving}
                            onPointerDown={saveEdit}
                            className="text-xs font-bold rounded-lg px-3 py-1.5 transition-opacity disabled:opacity-50 text-white"
                            style={{ background: `linear-gradient(135deg, ${c.tileFrom}, ${c.tileTo})`, border: `1px solid ${c.tileBorder}` }}
                          >
                            Save
                          </button>
                          <button
                            onPointerDown={() => setEditing(null)}
                            className="text-xs font-bold text-gray-600 hover:text-gray-300 px-2 py-1.5 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        customLabel ? (
                          <button
                            onPointerDown={() => resetTile(key)}
                            className="text-gray-700 hover:text-rose-400 text-sm shrink-0 transition-colors pl-1"
                            title="Reset to default"
                          >
                            ↺
                          </button>
                        ) : (
                          <span className="w-5 shrink-0" />
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="flex justify-center pb-10">
          <button
            onPointerDown={resetAll}
            className="text-sm font-bold uppercase tracking-wider transition-colors"
            style={{ color: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fda4af'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
          >
            Reset all to defaults
          </button>
        </div>
      </div>
    </div>
  )
}
