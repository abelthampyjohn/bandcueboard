import { useState, useEffect } from 'react'
import { ref, update, onValue } from 'firebase/database'
import { db } from '../firebase'
import { CATEGORIES, COLOR_MAP, tileKey } from '../constants'

export default function Settings({ roomCode, onClose }) {
  const [tileNames, setTileNames] = useState({})
  const [editing, setEditing] = useState(null) // { key, value }
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
    <div className="bg-gray-950 min-h-screen flex flex-col" style={{ userSelect: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
        <span className="text-white font-black text-lg uppercase tracking-tight">
          Settings — Rename Tiles
        </span>
        <button
          onPointerDown={onClose}
          className="text-gray-400 hover:text-white font-black text-xl px-2 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {CATEGORIES.map((cat, catIdx) => {
          const c = COLOR_MAP[cat.color]
          return (
            <div key={cat.name} className="mb-5">
              <div className={`px-3 py-1.5 rounded-t-lg text-xs font-bold uppercase tracking-widest ${c.header} mb-1`}>
                {cat.name}
              </div>
              <div className="flex flex-col gap-1">
                {cat.tiles.map((defaultLabel, tileIdx) => {
                  const key = tileKey(catIdx, tileIdx)
                  const customLabel = tileNames[key]
                  const isEditing = editing?.key === key

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 border border-gray-800"
                    >
                      {/* Default label */}
                      <span className="text-gray-500 text-sm w-28 shrink-0">{defaultLabel}</span>
                      <span className="text-gray-700 text-sm shrink-0">→</span>

                      {/* Editable name */}
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditing(null)
                          }}
                          className="flex-1 bg-gray-800 border border-indigo-500 text-white font-bold text-sm rounded-lg px-2 py-1 outline-none uppercase tracking-wide"
                          maxLength={20}
                        />
                      ) : (
                        <button
                          onPointerDown={() => startEdit(key, customLabel ?? defaultLabel)}
                          className={`flex-1 text-left font-bold text-sm uppercase tracking-wide px-2 py-1 rounded-lg border transition-colors ${
                            customLabel
                              ? 'text-white border-gray-600 bg-gray-800 hover:border-indigo-500'
                              : 'text-gray-500 border-transparent hover:border-gray-700 hover:text-gray-300'
                          }`}
                        >
                          {customLabel ?? defaultLabel}
                        </button>
                      )}

                      {/* Action buttons */}
                      {isEditing ? (
                        <div className="flex gap-1 shrink-0">
                          <button
                            disabled={saving}
                            onPointerDown={saveEdit}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded px-2 py-1 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onPointerDown={() => setEditing(null)}
                            className="text-gray-500 hover:text-gray-300 text-xs font-bold px-2 py-1 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        customLabel && (
                          <button
                            onPointerDown={() => resetTile(key)}
                            className="text-gray-700 hover:text-rose-400 text-xs shrink-0 transition-colors"
                            title="Reset to default"
                          >
                            ↺
                          </button>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="mt-2 mb-8 flex justify-center">
          <button
            onPointerDown={resetAll}
            className="text-gray-600 hover:text-rose-400 text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Reset all tile names to defaults
          </button>
        </div>
      </div>
    </div>
  )
}
