import type { ProviderConfig } from '../../types'
import { getPathValue, renderTemplate } from '../../utils/templateRenderer'

type GenerateLocalMusicInput = {
  lyrics: string
  style: string
  config: ProviderConfig
}

export async function generateLocalMusic({ lyrics, style, config }: GenerateLocalMusicInput) {
  const rendered = renderTemplate(config.musicLocalRequestSchema, { lyrics, style })
  const response = await fetch(config.musicLocalBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.musicLocalApiKey ? { Authorization: `Bearer ${config.musicLocalApiKey}` } : {}),
    },
    body: rendered,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        'Local music request failed. If this is a CORS error, configure your local server to allow this app origin.',
    )
  }

  const audio = getPathValue(data, config.musicLocalResponsePath)
  if (typeof audio !== 'string') {
    throw new Error(`Could not find audio at response path "${config.musicLocalResponsePath}".`)
  }
  return audio
}
