import { useState, useCallback } from 'react'
import { COLOR_MAP } from '../constants'

export default function CueTile({ label, color, onTap, isActive = false, disabled = false }) {
  const [pressed, setPressed] = useState(false)
  const c = COLOR_MAP[color]

  const handleTap = useCallback(() => {
    if (disabled) return
    setPressed(true)
    onTap(label, color)
    setTimeout(() => setPressed(false), 380)
  }, [label, color, onTap, disabled])

  const bg = pressed
    ? `linear-gradient(135deg, ${c.flashFrom} 0%, ${c.flashTo} 100%)`
    : isActive
    ? `linear-gradient(135deg, ${c.flashFrom}cc 0%, ${c.flashTo}99 100%)`
    : `linear-gradient(160deg, ${c.tileFrom} 0%, ${c.tileTo} 100%)`

  const borderColor = pressed || isActive ? c.flashFrom : c.tileBorder

  const textColor = pressed || isActive ? c.flashText : c.tileText

  const shadow = pressed
    ? `0 0 28px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
    : isActive
    ? `0 0 16px ${c.glow}, 0 0 0 2px ${c.flashFrom}60, inset 0 1px 0 rgba(255,255,255,0.12)`
    : `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`

  const scale = pressed ? 'scale(0.94)' : 'scale(1)'

  return (
    <button
      onPointerDown={handleTap}
      disabled={disabled}
      className={`
        flex items-center justify-center text-center
        rounded-2xl border select-none
        font-black uppercase leading-tight
        min-h-[76px] sm:min-h-[92px]
        px-3 py-3
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: bg,
        borderColor,
        color: textColor,
        boxShadow: shadow,
        transform: scale,
        transition: pressed
          ? 'transform 0.06s ease, box-shadow 0.06s ease, background 0.06s ease, border-color 0.06s ease, color 0.06s ease'
          : 'transform 0.18s ease, box-shadow 0.3s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.08em',
        fontSize: 'clamp(1.05rem, 2.6vw, 1.5rem)',
      }}
    >
      {label}
    </button>
  )
}
