import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabaseEnv, supabase } from '../lib/supabase'
import type { AuthState, Profile } from '../types'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: hasSupabaseEnv,
    error: hasSupabaseEnv ? null : 'Add your Supabase browser env vars to continue.',
  })

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({ user: null, profile: null, loading: false, error: null })
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle<Profile>()

    setState({
      user: session.user,
      profile: data,
      loading: false,
      error: error?.message ?? null,
    })
  }, [])

  useEffect(() => {
    if (!hasSupabaseEnv) {
      return
    }

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    await loadProfile(data.session)
  }, [loadProfile])

  return {
    ...state,
    refreshProfile,
  }
}
