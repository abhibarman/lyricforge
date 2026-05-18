import type { Mood, SongOptions } from '../types'
import { moods } from '../constants/providerPresets'

type IdeaInputProps = {
  idea: string
  options: SongOptions
  onIdeaChange: (idea: string) => void
  onOptionsChange: (options: SongOptions) => void
}

export function IdeaInput({ idea, options, onIdeaChange, onOptionsChange }: IdeaInputProps) {
  function toggleMood(mood: Mood) {
    const nextMoods = options.moods.includes(mood)
      ? options.moods.filter((item) => item !== mood)
      : [...options.moods, mood]
    onOptionsChange({ ...options, moods: nextMoods })
  }

  return (
    <section className="space-y-4">
      <label className="block text-sm font-semibold text-slate-200">
        Your idea
        <textarea
          className="field mt-2 min-h-32 text-base"
          value={idea}
          onChange={(event) => onIdeaChange(event.target.value)}
          placeholder="A melancholic indie song about leaving a hometown in the rain"
        />
      </label>

      <details className="studio-card rounded-xl p-5" open>
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">
          Song Options
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-200">
            Genre / Style
            <input
              className="field"
              value={options.genre}
              onChange={(event) => onOptionsChange({ ...options, genre: event.target.value })}
              placeholder="Indie folk, synth pop, acoustic ballad"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Language
            <input
              className="field"
              value={options.language}
              onChange={(event) => onOptionsChange({ ...options, language: event.target.value })}
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Song Structure
            <select
              className="field"
              value={options.structure}
              onChange={(event) =>
                onOptionsChange({ ...options, structure: event.target.value as SongOptions['structure'] })
              }
            >
              <option>Verse-Chorus</option>
              <option>Verse-Chorus-Bridge</option>
              <option>Through-composed</option>
              <option>Custom</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Verse count
            <input
              className="field"
              min={1}
              max={6}
              type="number"
              value={options.verseCount}
              onChange={(event) =>
                onOptionsChange({ ...options, verseCount: Number(event.target.value) })
              }
            />
          </label>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-200">Mood</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  options.moods.includes(mood)
                    ? 'border-teal-300/45 bg-teal-400/15 text-teal-100'
                    : 'border-slate-700 bg-slate-950/55 text-slate-300 hover:border-slate-500'
                }`}
                onClick={() => toggleMood(mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={options.includeOutro}
            onChange={(event) =>
              onOptionsChange({ ...options, includeOutro: event.target.checked })
            }
          />
          Include outro
        </label>
      </details>
    </section>
  )
}
