import type { Mood, ProviderConfig, SongOptions } from '../types'

export const lyricsProviderOptions = [
  {
    value: 'anthropic',
    label: 'Anthropic',
    models: [
      { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    models: [
      { value: 'gpt-5.5', label: 'GPT-5.5' },
      { value: 'gpt-5.4-mini', label: 'GPT-5.4 mini' },
      { value: 'gpt-5.4-nano', label: 'GPT-5.4 nano' },
    ],
  },
] as const

export const musicModelOptions = [
  {
    value: 'minimax/music-2.6',
    label: 'MiniMax Music 2.6',
    hint: 'Full songs with lyrics and vocals',
  },
  {
    value: 'meta/musicgen',
    label: 'Meta MusicGen',
    hint: 'Prompt-based instrumental/music drafts',
  },
] as const

export const moods: Mood[] = [
  'Happy',
  'Sad',
  'Angry',
  'Romantic',
  'Nostalgic',
  'Energetic',
  'Mysterious',
]

export const defaultSongOptions: SongOptions = {
  genre: '',
  moods: ['Nostalgic'],
  structure: 'Verse-Chorus-Bridge',
  language: 'English',
  verseCount: 2,
  includeOutro: true,
}

export const defaultProviderConfig: ProviderConfig = {
  lyricsMode: 'cloud',
  lyricsProvider: 'anthropic',
  lyricsModel: 'claude-sonnet-4-5-20250929',
  lyricsLocalBaseUrl: 'http://localhost:11434/v1',
  lyricsLocalApiKey: '',
  lyricsSystemPrompt:
    'You are LyricForge, a careful songwriting assistant. Write polished, original lyrics with clear section headers like [Verse 1], [Chorus], and [Bridge].',
  musicMode: 'cloud',
  musicProvider: 'replicate',
  musicModel: 'minimax/music-2.6',
  musicLocalBaseUrl: 'http://localhost:8080/v1',
  musicLocalApiKey: '',
  musicLocalRequestSchema:
    '{"prompt":"{style}\\n\\nLyrics:\\n{lyrics}","duration":30}',
  musicLocalResponsePath: 'audio',
}
