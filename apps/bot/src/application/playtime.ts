/** Faixa rankeada com dados para cálculo de tempo de audição. */
export interface RankedTrack {
  readonly name: string
  readonly artist: string
  readonly url: string | null
  readonly playcount: number
  readonly durationSeconds: number | null
}

export interface PlaytimeResult {
  /** Σ(playcount × duração), estimando durações ausentes. */
  readonly totalSeconds: number
  /** Média das durações conhecidas (null se nenhuma). */
  readonly averageDurationSeconds: number | null
  /** Fração dos plays com duração estimada (0–1). */
  readonly estimatedShare: number
}

/**
 * Tempo total de audição de uma lista de faixas rankeadas.
 * Faixas sem duração recebem a MÉDIA das durações conhecidas
 * (estimativa — o chamador decide se marca como aproximado).
 */
export function computePlaytime(tracks: RankedTrack[]): PlaytimeResult {
  const knownDurations = tracks
    .map((track) => track.durationSeconds)
    .filter((duration): duration is number => duration !== null && duration > 0)

  const averageDurationSeconds =
    knownDurations.length > 0
      ? knownDurations.reduce((sum, duration) => sum + duration, 0) / knownDurations.length
      : null

  const totalPlaycount = tracks.reduce((sum, track) => sum + track.playcount, 0)
  let totalSeconds = 0
  let estimatedPlaycount = 0

  for (const track of tracks) {
    const known = track.durationSeconds !== null && track.durationSeconds > 0
    if (!known) estimatedPlaycount += track.playcount
    const effectiveDuration = known ? track.durationSeconds : averageDurationSeconds
    if (effectiveDuration === null) continue
    totalSeconds += track.playcount * effectiveDuration
  }

  return {
    totalSeconds: Math.round(totalSeconds),
    averageDurationSeconds:
      averageDurationSeconds !== null ? Math.round(averageDurationSeconds) : null,
    estimatedShare: totalPlaycount > 0 ? estimatedPlaycount / totalPlaycount : 0,
  }
}
