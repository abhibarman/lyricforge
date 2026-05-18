import type { User } from '@supabase/supabase-js'

export type ProviderMode = 'cloud' | 'local'

export type LyricsProvider = 'anthropic' | 'openai' | 'ollama' | 'lmstudio' | 'custom'

export type MusicProvider = 'replicate' | 'custom-local'

export type Mood =
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Romantic'
  | 'Nostalgic'
  | 'Energetic'
  | 'Mysterious'

export type SongOptions = {
  genre: string
  moods: Mood[]
  structure: 'Verse-Chorus' | 'Verse-Chorus-Bridge' | 'Through-composed' | 'Custom'
  language: string
  verseCount: number
  includeOutro: boolean
}

export type ProviderConfig = {
  lyricsMode: ProviderMode
  lyricsProvider: LyricsProvider
  lyricsModel: string
  lyricsLocalBaseUrl: string
  lyricsLocalApiKey: string
  lyricsSystemPrompt: string
  musicMode: ProviderMode
  musicProvider: MusicProvider
  musicModel: string
  musicLocalBaseUrl: string
  musicLocalApiKey: string
  musicLocalRequestSchema: string
  musicLocalResponsePath: string
}

export type LyricsSection = {
  id: string
  title: string
  body: string
}

export type GenerationHistoryItem = {
  id: string
  idea: string
  lyrics: LyricsSection[]
  audioUrl?: string
  createdAt: string
}

export type Profile = {
  id: string
  email: string | null
  credits_remaining: number
  credits_used: number
  created_at: string
  updated_at: string
}

export type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}
