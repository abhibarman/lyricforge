import { X } from 'lucide-react'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="studio-card w-full max-w-lg rounded-xl p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            type="button"
            className="icon-button rounded-lg p-2"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <p>Provider configuration is in the left panel for this MVP.</p>
          <p>
            Local API keys are kept in session storage only. Cloud provider keys stay in Vercel
            environment variables.
          </p>
        </div>
      </div>
    </div>
  )
}
