import { defaultProviderConfig, defaultSongOptions } from '../constants/providerPresets'
import type { ProviderConfig, SongOptions } from '../types'

const CONFIG_KEY = 'lyricforge_config'
const OPTIONS_KEY = 'lyricforge_song_options'

export function loadProviderConfig(): ProviderConfig {
  return loadJson(CONFIG_KEY, defaultProviderConfig)
}

export function saveProviderConfig(config: ProviderConfig) {
  localStorage.setItem(
    CONFIG_KEY,
    JSON.stringify(config, (key, value) =>
      key === 'lyricsLocalApiKey' || key === 'musicLocalApiKey' ? undefined : value,
    ),
  )
  if (config.lyricsLocalApiKey) {
    sessionStorage.setItem('lyricforge_lyrics_local_api_key', config.lyricsLocalApiKey)
  }
  if (config.musicLocalApiKey) {
    sessionStorage.setItem('lyricforge_music_local_api_key', config.musicLocalApiKey)
  }
}

export function loadSongOptions(): SongOptions {
  return loadJson(OPTIONS_KEY, defaultSongOptions)
}

export function saveSongOptions(options: SongOptions) {
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(options))
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}
