import type { ProviderConfig } from '../../types'
import { lyricsProviderOptions, musicModelOptions } from '../../constants/providerPresets'

type ProviderPanelProps = {
  config: ProviderConfig
  onChange: (config: ProviderConfig) => void
}

export function ProviderPanel({ config, onChange }: ProviderPanelProps) {
  const selectedLyricsProvider =
    lyricsProviderOptions.find((provider) => provider.value === config.lyricsProvider) ??
    lyricsProviderOptions[0]

  return (
    <aside className="studio-panel space-y-5 border-b p-4 lg:border-b-0 lg:border-r">
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Lyrics Provider
        </h2>
        <ModeToggle
          value={config.lyricsMode}
          onChange={(lyricsMode) => onChange({ ...config, lyricsMode })}
        />
        {config.lyricsMode === 'cloud' ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-200">
              Provider
              <select
                className="field"
                value={config.lyricsProvider}
                onChange={(event) => {
                  const provider = lyricsProviderOptions.find(
                    (option) => option.value === event.target.value,
                  )
                  if (!provider) return
                  onChange({
                    ...config,
                    lyricsProvider: provider.value,
                    lyricsModel: provider.models[0].value,
                  })
                }}
              >
                {lyricsProviderOptions.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Model
              <select
                className="field"
                value={config.lyricsModel}
                onChange={(event) => onChange({ ...config, lyricsModel: event.target.value })}
              >
                {selectedLyricsProvider.models.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-200">
              Base URL
              <input
                className="field"
                value={config.lyricsLocalBaseUrl}
                onChange={(event) =>
                  onChange({ ...config, lyricsLocalBaseUrl: event.target.value })
                }
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Model
              <input
                className="field"
                value={config.lyricsModel}
                onChange={(event) => onChange({ ...config, lyricsModel: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Optional API key
              <input
                className="field"
                type="password"
                value={config.lyricsLocalApiKey}
                onChange={(event) =>
                  onChange({ ...config, lyricsLocalApiKey: event.target.value })
                }
              />
            </label>
          </div>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-400">
            System prompt
          </summary>
          <textarea
            className="field mt-2 min-h-28"
            value={config.lyricsSystemPrompt}
            onChange={(event) => onChange({ ...config, lyricsSystemPrompt: event.target.value })}
          />
        </details>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Music Provider
        </h2>
        <ModeToggle
          value={config.musicMode}
          onChange={(musicMode) => onChange({ ...config, musicMode })}
        />
        {config.musicMode === 'cloud' ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-200">
              Provider
              <select className="field" value={config.musicProvider} disabled>
                <option value="replicate">Replicate MusicGen</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Model
              <select
                className="field"
                value={config.musicModel}
                onChange={(event) => onChange({ ...config, musicModel: event.target.value })}
              >
                {musicModelOptions.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-slate-500">
              {musicModelOptions.find((model) => model.value === config.musicModel)?.hint}
            </p>
            <p className="rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-xs text-amber-100">
              Replicate credits are used when the prediction is created.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-200">
              Endpoint URL
              <input
                className="field"
                value={config.musicLocalBaseUrl}
                onChange={(event) => onChange({ ...config, musicLocalBaseUrl: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Response path
              <input
                className="field"
                value={config.musicLocalResponsePath}
                onChange={(event) =>
                  onChange({ ...config, musicLocalResponsePath: event.target.value })
                }
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Request schema
              <textarea
                className="field mt-1 min-h-24 font-mono text-xs"
                value={config.musicLocalRequestSchema}
                onChange={(event) =>
                  onChange({ ...config, musicLocalRequestSchema: event.target.value })
                }
              />
            </label>
          </div>
        )}
      </section>
    </aside>
  )
}

function ModeToggle({
  value,
  onChange,
}: {
  value: 'cloud' | 'local'
  onChange: (value: 'cloud' | 'local') => void
}) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-slate-700/60 bg-slate-950/70 p-1">
      {(['cloud', 'local'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${value === mode ? 'bg-teal-400/15 text-teal-100 shadow-sm ring-1 ring-teal-300/25' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => onChange(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}
