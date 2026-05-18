import type { ProviderConfig, SongOptions } from '../../types'
import { getAccessToken } from '../session'

type GenerateLyricsInput = {
  idea: string
  options: SongOptions
  config: ProviderConfig
}

export async function generateCloudLyrics({ idea, options, config }: GenerateLyricsInput) {
  const token = await getAccessToken()
  const route =
    config.lyricsProvider === 'openai' ? '/api/lyrics/openai' : '/api/lyrics/anthropic'

  const response = await fetch(route, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idea,
      options,
      model: config.lyricsModel,
      systemPrompt: config.lyricsSystemPrompt,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error ?? 'Lyrics generation failed.')
  }

  return data.lyrics as string
}
