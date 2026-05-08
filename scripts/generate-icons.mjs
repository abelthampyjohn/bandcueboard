/**
 * Generates PWA icons from an inline SVG using sharp.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

// Clean, stage-ready icon: dark background, coloured grid of tiles, music note
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <!-- Dark background -->
  <rect width="512" height="512" rx="${size === 180 ? 90 : 80}" fill="#030712"/>

  <!-- Grid of cue tiles — 3 columns × 4 rows, colour-coded by category -->
  <!-- Row 1: indigo (Song Structure) -->
  <rect x="48"  y="80"  width="120" height="72" rx="14" fill="#4338ca"/>
  <rect x="196" y="80"  width="120" height="72" rx="14" fill="#4338ca"/>
  <rect x="344" y="80"  width="120" height="72" rx="14" fill="#4338ca"/>

  <!-- Row 2: amber (Dynamics) -->
  <rect x="48"  y="170" width="120" height="72" rx="14" fill="#b45309"/>
  <rect x="196" y="170" width="120" height="72" rx="14" fill="#b45309"/>
  <rect x="344" y="170" width="120" height="72" rx="14" fill="#b45309"/>

  <!-- Row 3: cyan (Tempo) + violet (Key Changes) -->
  <rect x="48"  y="260" width="120" height="72" rx="14" fill="#0e7490"/>
  <rect x="196" y="260" width="120" height="72" rx="14" fill="#6d28d9"/>
  <rect x="344" y="260" width="120" height="72" rx="14" fill="#6d28d9"/>

  <!-- Row 4: rose (Commands) — two full + one accent -->
  <rect x="48"  y="350" width="120" height="72" rx="14" fill="#be123c"/>
  <rect x="196" y="350" width="120" height="72" rx="14" fill="#be123c"/>
  <!-- Flash tile (bright) -->
  <rect x="344" y="350" width="120" height="72" rx="14" fill="#fb7185"/>

  <!-- "▶" play arrow on the bright tile -->
  <polygon points="368,371 368,407 400,389" fill="#030712" opacity="0.85"/>

  <!-- Subtle horizontal label lines on tiles -->
  <rect x="60"  y="108" width="96" height="8" rx="4" fill="#6366f1" opacity="0.6"/>
  <rect x="208" y="108" width="96" height="8" rx="4" fill="#6366f1" opacity="0.6"/>
  <rect x="356" y="108" width="96" height="8" rx="4" fill="#6366f1" opacity="0.6"/>

  <rect x="60"  y="198" width="72" height="8" rx="4" fill="#f59e0b" opacity="0.6"/>
  <rect x="208" y="198" width="84" height="8" rx="4" fill="#f59e0b" opacity="0.6"/>
  <rect x="356" y="198" width="60" height="8" rx="4" fill="#f59e0b" opacity="0.6"/>

  <rect x="60"  y="288" width="80" height="8" rx="4" fill="#22d3ee" opacity="0.6"/>
  <rect x="208" y="288" width="68" height="8" rx="4" fill="#a78bfa" opacity="0.6"/>
  <rect x="356" y="288" width="68" height="8" rx="4" fill="#a78bfa" opacity="0.6"/>

  <rect x="60"  y="378" width="80" height="8" rx="4" fill="#fb7185" opacity="0.6"/>
  <rect x="208" y="378" width="60" height="8" rx="4" fill="#fb7185" opacity="0.6"/>
</svg>
`

const sizes = [
  { name: 'icon-192.png',       size: 192 },
  { name: 'icon-512.png',       size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-maskable-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  const out = join(publicDir, name)
  await sharp(Buffer.from(svg(size)))
    .png()
    .toFile(out)
  console.log(`✓ ${name} (${size}×${size})`)
}

console.log('Icons generated in public/')
