import { useMemo, useRef, useState } from 'react'
import { Download, Pause, Play, Volume2 } from 'lucide-react'

type AudioPlayerProps = {
  audioUrl: string | null
  title: string
}

const waveformHeights = [28, 42, 22, 58, 36, 50, 30, 64, 38, 48, 26, 56, 34, 46, 24, 62, 40, 52]

export function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [playbackRate, setPlaybackRate] = useState(1)
  const displayTitle = title || 'Generated Song'
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bars = useMemo(() => waveformHeights, [])

  if (!audioUrl) {
    return (
      <section className="studio-card overflow-hidden rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Audio Player
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-200">Waiting for music</h2>
          </div>
          <div className="grid size-11 place-items-center rounded-full border border-slate-700 bg-slate-950/70 text-slate-500">
            <Play size={18} aria-hidden="true" />
          </div>
        </div>
        <div className="flex h-20 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/45 px-4">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="wave-bar opacity-25"
              style={{ height: `${height}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    )
  }

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  function seek(value: number) {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = (value / 100) * duration
    setCurrentTime(audio.currentTime)
  }

  function changeVolume(value: number) {
    const audio = audioRef.current
    setVolume(value)
    if (audio) audio.volume = value
  }

  function changePlaybackRate(value: number) {
    const audio = audioRef.current
    setPlaybackRate(value)
    if (audio) audio.playbackRate = value
  }

  return (
    <section className="studio-card overflow-hidden rounded-xl">
      <div className="border-b border-slate-800/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
              Master Preview
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{displayTitle}</h2>
            <p className="mt-1 text-sm text-slate-400">Generated audio ready for review</p>
          </div>
          <a
            className="icon-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
            href={audioUrl}
            download="lyricforge-song"
          >
            <Download size={16} aria-hidden="true" />
            Download
          </a>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 flex h-24 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/55 px-4">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={`wave-bar ${isPlaying ? 'opacity-90' : 'opacity-45'}`}
              style={{ height: `${height}%` }}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause song' : 'Play song'}
            >
              {isPlaying ? <Pause size={21} aria-hidden="true" /> : <Play size={21} aria-hidden="true" />}
            </button>

            <div className="min-w-0 flex-1">
              <input
                className="range w-full"
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Audio progress"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/45 px-3 py-3">
            <label className="flex min-w-48 items-center gap-3 text-sm text-slate-300">
              <Volume2 size={16} aria-hidden="true" />
              <input
                className="range w-32"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                aria-label="Volume"
              />
              <span className="w-9 text-right text-xs text-slate-500">{Math.round(volume * 100)}%</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              Speed
              <select
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-200 outline-none"
                value={playbackRate}
                onChange={(event) => changePlaybackRate(Number(event.target.value))}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0)
          event.currentTarget.volume = volume
          event.currentTarget.playbackRate = playbackRate
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => setIsPlaying(false)}
      />
    </section>
  )
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
