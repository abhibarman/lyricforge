import { useState } from 'react'
import { Music2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function AuthScreen({ envError }: { envError: string | null }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setMessage(null)
    if (envError) {
      setMessage(envError)
      return
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    const redirectTo = `${window.location.origin}/auth/callback`
    const result =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }
    setMessage(
      mode === 'signup'
        ? 'Check your email to verify your account.'
        : 'Logged in. Loading your workspace...',
    )
  }

  async function signInWithProvider(provider: 'google' | 'github') {
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
  }

  async function resetPassword() {
    if (!email) {
      setMessage('Enter your email first, then click forgot password.')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setMessage(error?.message ?? 'Password reset email sent.')
  }

  return (
    <main className="min-h-screen px-4 py-10 text-slate-100">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="studio-card rounded-xl p-6">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-teal-400 text-slate-950">
              <Music2 aria-hidden="true" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">LyricForge</h1>
              <p className="text-sm text-slate-400">Turn a rough idea into a finished song.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg border border-slate-700/60 bg-slate-950/70 p-1">
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'signup' ? 'bg-teal-400/15 text-teal-100 shadow-sm ring-1 ring-teal-300/25' : 'text-slate-400'}`}
              type="button"
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'login' ? 'bg-teal-400/15 text-teal-100 shadow-sm ring-1 ring-teal-300/25' : 'text-slate-400'}`}
              type="button"
              onClick={() => setMode('login')}
            >
              Log in
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">
              Email
              <input
                className="field"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <input
                className="field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
            {mode === 'signup' && (
              <label className="block text-sm font-medium text-slate-200">
                Confirm password
                <input
                  className="field"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            )}
            <button
              className="primary-action w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={loading}
              onClick={submit}
            >
              {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </div>

          {mode === 'login' && (
            <button
              className="mt-3 text-sm font-medium text-teal-300 hover:underline"
              type="button"
              onClick={resetPassword}
            >
              Forgot password?
            </button>
          )}

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            OAuth
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="icon-button rounded-lg px-3 py-2 text-sm font-medium"
              type="button"
              onClick={() => signInWithProvider('google')}
            >
              Google
            </button>
            <button
              className="icon-button rounded-lg px-3 py-2 text-sm font-medium"
              type="button"
              onClick={() => signInWithProvider('github')}
            >
              GitHub
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100" aria-live="polite">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
