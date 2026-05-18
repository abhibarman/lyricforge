import { supabase } from '../lib/supabase'

export async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session?.access_token) {
    throw new Error('Session expired. Please log in again.')
  }

  return session.access_token
}
