import { useEffect, useMemo, useState } from 'react'
import { Music, PenLine } from 'lucide-react'
import { AudioPlayer } from './components/AudioPlayer/AudioPlayer'
import { AuthScreen } from './components/auth/AuthScreen'
import { IdeaInput } from './components/IdeaInput'
import { Header } from './components/layout/Header'
import { LyricsEditor } from './components/LyricsEditor/LyricsEditor'
import { ProviderPanel } from './components/ProviderPanel/ProviderPanel'
import { SessionHistory } from './components/SessionHistory'
import { SettingsModal } from './components/SettingsModal/SettingsModal'
import { generateCloudLyrics } from './client/lyrics/cloudClient'
import { generateLocalLyrics } from './client/lyrics/localClient'
import { generateCloudMusic, pollReplicatePrediction } from './client/music/cloudClient'
import { generateLocalMusic } from './client/music/localClient'
import { useAuth } from './hooks/useAuth'
import type { GenerationHistoryItem, LyricsSection, ProviderConfig, SongOptions } from './types'
import { parseLyrics, serializeLyrics } from './utils/lyricsParser'
import {
  loadProviderConfig,
  loadSongOptions,
  saveProviderConfig,
  saveSongOptions,
} from './utils/storage'

function App() {
  const { user, profile, loading, error, refreshProfile } = useAuth()
  const [idea, setIdea] = useState('')
  const [options, setOptions] = useState<SongOptions>(() => loadSongOptions())
  const [config, setConfig] = useState<ProviderConfig>(() => loadProviderConfig())
  const [lyrics, setLyrics] = useState<LyricsSection[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [history, setHistory] = useState<GenerationHistoryItem[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false)
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false)

  useEffect(() => saveSongOptions(options), [options])
  useEffect(() => saveProviderConfig(config), [config])

  const songTitle = useMemo(() => idea.trim().slice(0, 60), [idea])
  const lyricsText = useMemo(() => serializeLyrics(lyrics), [lyrics])
  const cloudMusicBlocked = config.musicMode === 'cloud' && (profile?.credits_remaining ?? 0) <= 0

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-slate-300">Loading LyricForge...</main>
  }

  if (!user) {
    return <AuthScreen envError={error} />
  }

  async function handleGenerateLyrics() {
    setStatus(null)
    setIsGeneratingLyrics(true)
    try {
      const raw =
        config.lyricsMode === 'cloud'
          ? await generateCloudLyrics({ idea, options, config })
          : await generateLocalLyrics({ idea, options, config })
      setLyrics(parseLyrics(raw))
      setAudioUrl(null)
      setStatus('Lyrics generated. Review or edit them, then generate music.')
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Lyrics generation failed.')
    } finally {
      setIsGeneratingLyrics(false)
    }
  }

  async function handleGenerateMusic() {
    setStatus(null)
    setIsGeneratingMusic(true)
    try {
      const style = [options.genre, options.moods.join(', ')].filter(Boolean).join(', ')
      const nextAudioUrl =
        config.musicMode === 'cloud'
          ? await generateCloudMusic({ lyrics: lyricsText, style, config }).then(async (result) => {
              await refreshProfile()
              if (result.predictionUrl) {
                setStatus('Music generation started. Polling Replicate...')
                return pollReplicatePrediction(result.predictionUrl)
              }
              return result.audioUrl ?? ''
            })
          : await generateLocalMusic({ lyrics: lyricsText, style, config })

      setAudioUrl(nextAudioUrl)
      setHistory((items) =>
        [
          {
            id: crypto.randomUUID(),
            idea,
            lyrics,
            audioUrl: nextAudioUrl,
            createdAt: new Date().toISOString(),
          },
          ...items,
        ].slice(0, 5),
      )
      setStatus('Music ready.')
      await refreshProfile()
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Music generation failed.')
    } finally {
      setIsGeneratingMusic(false)
    }
  }

  function applyConfig(nextConfig: ProviderConfig) {
    setConfig(nextConfig)
  }

  return (
    <main className="min-h-screen text-slate-100">
      <Header email={user.email} profile={profile} onOpenSettings={() => setSettingsOpen(true)} />
      {user.email_confirmed_at === null && (
        <div className="border-b border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          Please verify your email to use cloud providers. Local providers are still available.
        </div>
      )}
      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[320px_1fr]">
        <ProviderPanel config={config} onChange={applyConfig} />

        <div className="space-y-6 p-4 lg:p-7">
          <IdeaInput idea={idea} options={options} onIdeaChange={setIdea} onOptionsChange={setOptions} />

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="primary-action inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!idea.trim() || isGeneratingLyrics}
              onClick={handleGenerateLyrics}
            >
              <PenLine size={16} aria-hidden="true" />
              {isGeneratingLyrics ? 'Generating lyrics...' : 'Generate Lyrics'}
            </button>
            <button
              className="secondary-action inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={lyrics.length === 0 || isGeneratingMusic || cloudMusicBlocked}
              aria-disabled={lyrics.length === 0 || isGeneratingMusic || cloudMusicBlocked}
              title={cloudMusicBlocked ? 'No credits remaining. Switch to local music to continue.' : undefined}
              onClick={handleGenerateMusic}
            >
              <Music size={16} aria-hidden="true" />
              {isGeneratingMusic ? 'Generating music...' : 'Generate Music'}
            </button>
            {cloudMusicBlocked && (
              <p className="text-sm text-red-300">
                No credits remaining. Switch to a local model to continue.
              </p>
            )}
          </div>

          {status && (
            <p className="rounded-lg border border-teal-300/20 bg-teal-400/10 px-3 py-2 text-sm text-teal-100" aria-live="polite">
              {status}
            </p>
          )}

          <LyricsEditor sections={lyrics} onChange={setLyrics} />
          <AudioPlayer audioUrl={audioUrl} title={songTitle} />
          <SessionHistory
            items={history}
            onSelect={(item) => {
              setIdea(item.idea)
              setLyrics(item.lyrics)
              setAudioUrl(item.audioUrl ?? null)
            }}
          />
        </div>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </main>
  )
}

export default App
