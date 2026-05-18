import type { ProviderConfig } from '../../types'
import { getAccessToken } from '../session'

type GenerateCloudMusicInput = {
  lyrics: string
  style: string
  config: ProviderConfig
}

export async function generateCloudMusic({ lyrics, style, config }: GenerateCloudMusicInput) {
  const token = await getAccessToken()
  const response = await fetch('/api/music/replicate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lyrics,
      style,
      model: config.musicModel,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error ?? 'Music generation failed.')
  }

  return data as {
    audioUrl?: string
    predictionUrl?: string
    creditsRemaining: number
  }
}

export async function pollReplicatePrediction(predictionUrl: string, signal?: AbortSignal) {
  const token = await getAccessToken()
  const predictionId = extractPredictionId(predictionUrl)

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    const response = await fetch(`/api/music/replicate-status?id=${encodeURIComponent(predictionId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? 'Could not check Replicate prediction status.')
    }

    if (data.status === 'succeeded') {
      if (typeof data.audioUrl === 'string') return data.audioUrl
      throw new Error('Replicate succeeded but did not return an audio URL.')
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error ?? `Replicate prediction ${data.status}.`)
    }
  }

  throw new Error('Music generation timed out after 3 minutes.')
}

function extractPredictionId(predictionUrl: string) {
  try {
    const url = new URL(predictionUrl)
    const id = url.pathname.split('/').filter(Boolean).at(-1)
    if (url.hostname === 'api.replicate.com' && id) return id
  } catch {
    // Fall through to raw id validation.
  }

  if (/^[a-zA-Z0-9_-]+$/.test(predictionUrl)) return predictionUrl
  throw new Error('Invalid Replicate prediction URL.')
}
