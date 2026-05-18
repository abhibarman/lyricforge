import { LogOut, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types'
import { CreditBadge } from './CreditBadge'

type HeaderProps = {
  email?: string
  profile: Profile | null
  onOpenSettings: () => void
}

export function Header({ email, profile, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#090b10]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xl font-semibold text-white">LyricForge</p>
          <p className="hidden text-xs text-slate-400 sm:block">Idea to lyrics to playable audio</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditBadge credits={profile?.credits_remaining ?? 0} />
          <button
            type="button"
            className="icon-button rounded-lg p-2"
            onClick={onOpenSettings}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button rounded-lg p-2"
            onClick={() => void supabase.auth.signOut()}
            aria-label={`Log out ${email ?? ''}`}
            title={email ? `Log out ${email}` : 'Log out'}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
