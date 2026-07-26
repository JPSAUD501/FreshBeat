import { describe, expect, it } from 'vitest'
import { computePlaytime, type RankedTrack } from './playtime.js'

function track(playcount: number, durationSeconds: number | null): RankedTrack {
  return { name: 'T', artist: 'A', url: null, playcount, durationSeconds }
}

describe('computePlaytime', () => {
  it('soma playcount × duração', () => {
    const result = computePlaytime([track(10, 200), track(5, 100)])
    expect(result.totalSeconds).toBe(10 * 200 + 5 * 100)
    expect(result.estimatedShare).toBe(0)
    expect(result.averageDurationSeconds).toBe(150)
  })

  it('estima durações ausentes pela média das conhecidas', () => {
    const result = computePlaytime([track(10, 200), track(10, null)])
    // média conhecida = 200 → estimada também 200
    expect(result.totalSeconds).toBe(10 * 200 + 10 * 200)
    expect(result.estimatedShare).toBe(0.5)
  })

  it('sem nenhuma duração conhecida, total é zero', () => {
    const result = computePlaytime([track(10, null), track(5, null)])
    expect(result.totalSeconds).toBe(0)
    expect(result.averageDurationSeconds).toBeNull()
    expect(result.estimatedShare).toBe(1)
  })

  it('lista vazia não quebra', () => {
    const result = computePlaytime([])
    expect(result.totalSeconds).toBe(0)
    expect(result.estimatedShare).toBe(0)
  })

  it('ignora durações zero/negativas ao calcular a média', () => {
    const result = computePlaytime([track(1, 0), track(1, 300)])
    expect(result.averageDurationSeconds).toBe(300)
  })
})
