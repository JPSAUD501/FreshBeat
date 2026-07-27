/**
 * Gera os assets visuais do site com `openai/gpt-image-2` via Replicate.
 *
 * Uso:
 *   REPLICATE_API_TOKEN=... npx tsx scripts/generate-site-art.ts
 *
 * (sem a env no shell, o script tenta ler do .env da raiz)
 *
 * Saída: apps/web/public/art/*.webp — assets estáticos commitados,
 * zero custo de geração em runtime.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Replicate from 'replicate'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'apps/web/public/art')
const MODEL = 'openai/gpt-image-2' as const

const STYLE =
  'dark cinematic music aesthetic, near-black background (#0a0a0c), ' +
  'neon green (#1DB954) accents, high contrast, subtle film grain, editorial, no text, no letters'

interface Asset {
  file: string
  prompt: string
  aspectRatio: '1:1' | '3:2' | '2:3'
}

const ASSETS: Asset[] = [
  {
    file: 'hero-waves.webp',
    aspectRatio: '3:2',
    prompt: `Abstract sound waves made of flowing neon green light ribbons over a pure black background, wide horizontal composition, waves rising from the bottom third, deep shadows, ultra detailed, crisp clean edges, ${STYLE}`,
  },
  {
    file: 'manifesto-texture.webp',
    aspectRatio: '3:2',
    prompt: `Macro photograph of a vinyl record surface, extreme close-up of grooves catching a thin neon green rim light on pure black vinyl, abstract minimal, ultra detailed, crisp clean edges, ${STYLE}`,
  },
  {
    file: 'ai-collage.webp',
    aspectRatio: '3:2',
    prompt: `Surreal collage of floating square album covers dissolving into particles of neon green light, arranged in a loose grid drifting apart, dreamlike, ultra detailed, crisp clean edges, ${STYLE}`,
  },
  {
    file: 'stats-equalizer.webp',
    aspectRatio: '3:2',
    prompt: `Minimal 3D bar chart like a music equalizer, thin glossy black monolith bars of varying heights with neon green edges glowing, on black reflective floor, ultra detailed, crisp clean edges, ${STYLE}`,
  },
]

async function loadToken(): Promise<string> {
  if (process.env.REPLICATE_API_TOKEN !== undefined && process.env.REPLICATE_API_TOKEN !== '') {
    return process.env.REPLICATE_API_TOKEN
  }
  const env = await readFile(path.join(ROOT, '.env'), 'utf8')
  const match = /^REPLICATE_API_TOKEN=["']?([^"'\n]+)["']?$/m.exec(env)
  if (match?.[1] === undefined) {
    throw new Error('REPLICATE_API_TOKEN não encontrada (env nem .env)')
  }
  return match[1]
}

async function outputToBytes(output: unknown): Promise<Uint8Array> {
  const first = Array.isArray(output) ? (output[0] as unknown) : output
  if (typeof first === 'object' && first !== null && 'blob' in first) {
    const blob = await (first as { blob: () => Promise<Blob> }).blob()
    return new Uint8Array(await blob.arrayBuffer())
  }
  if (typeof first === 'string' && first.startsWith('http')) {
    const response = await fetch(first)
    if (!response.ok) throw new Error(`Falha ao baixar imagem: HTTP ${response.status}`)
    return new Uint8Array(await response.arrayBuffer())
  }
  throw new Error('Replicate retornou um formato inesperado')
}

async function main(): Promise<void> {
  const token = await loadToken()
  const replicate = new Replicate({ auth: token })
  await mkdir(OUT_DIR, { recursive: true })

  for (const asset of ASSETS) {
    console.log(`🎨 Gerando ${asset.file}…`)
    const output: unknown = await replicate.run(MODEL, {
      input: {
        prompt: asset.prompt,
        aspect_ratio: asset.aspectRatio,
        quality: 'high',
        output_format: 'webp',
        output_compression: 100, // 100 = qualidade máxima
        background: 'opaque',
      },
    })
    const bytes = await outputToBytes(output)
    // O modelo devolve webp lossless (compression 100) — re-encoda para q88
    // (visualmente idêntico, ~10x menor para servir na web)
    const optimized = await sharp(Buffer.from(bytes)).webp({ quality: 88, effort: 6 }).toBuffer()
    await writeFile(path.join(OUT_DIR, asset.file), optimized)
    console.log(`   ✓ ${asset.file} (${(optimized.length / 1024).toFixed(0)} KB)`)
  }

  console.log(`\n✅ ${ASSETS.length} assets em apps/web/public/art/`)
}

await main()
