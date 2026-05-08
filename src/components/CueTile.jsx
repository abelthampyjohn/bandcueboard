import { useState, useCallback } from 'react'
import { COLOR_MAP } from '../constants'

export default function CueTile({ label, color, onTap, disabled = false }) {
  const [flashing, setFlashing] = useState(false)
  const c = COLOR_MAP[color]

  const handleTap = useCallback(() => {
    if (disabled) return
    setFlashing(true)
    onTap(label, color)
    setTimeout(() => setFlashing(false), 400)
  }, [label, color, onTap, disabled])

  return (
    <button
      onPointerDown={handleTap}
      disabled={disabled}
      className={`
        flex items-center justify-center text-center
        rounded-xl border-2 select-none cursor-pointer
        font-bold tracking-wide uppercase
        transition-colors duration-75 active:scale-95
        text-xl sm:text-2xl lg:text-3xl
        min-h-[72px] sm:min-h-[88px]
        px-2 py-3 leading-tight
        ${flashing ? c.flash : c.tile}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{ letterSpacing: '0.04em' }}
    >
      {label}
    </button>
  )
}
