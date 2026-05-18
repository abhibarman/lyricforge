import type { ProviderConfig, SongOptions } from '../../types'

type GenerateLocalLyricsInput = {
  idea: string
  options: SongOptions
  config: ProviderConfig
}

export async function generateLocalLyrics({ idea, options, config }: GenerateLocalLyricsInput) {
  const prompt = [
    config.lyricsSystemPrompt,
    '',
    `Idea: ${idea}`,
    `Genre/style: ${options.genre || 'open'}`,
    `Moods: ${options.moods.join(', ') || 'open'}`,
    `Structure: ${options.structure}`,
    `Language: ${options.language}`,
    `Verse count: ${options.verseCount}`,
    `Include outro: ${options.includeOutro ? 'yes' : 'no'}`,
  ].join('\n')

  const response = await fetch(`${config.lyricsLocalBaseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.lyricsLocalApiKey ? { Authorization: `Bearer ${config.lyricsLocalApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: config.lyricsModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        'Local lyrics request failed. If this is a CORS error, configure your local server to allow this app origin.',
    )
  }

  return data.choices?.[0]?.message?.content ?? ''
}
