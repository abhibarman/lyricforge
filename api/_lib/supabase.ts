import { createClient } from '@supabase/supabase-js'
import { getEnv } from './env.js'

export function createServiceClient() {

  const url = getEnv('SUPABASE_URL')
  const key = getEnv('SUPABASE_SECRET_KEY') ?? getEnv('SUPABASE_SERVICE_ROLE_KEY')

  console.log('SUPABASE_URL:', url) // add this
  console.log('KEY prefix:', key?.slice(0, 20)) // add this

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SECRET_KEY server environment variables.')
  }

  // const url = getEnv('SUPABASE_URL')
  // const key = getEnv('SUPABASE_SECRET_KEY') ?? getEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SECRET_KEY server environment variables.')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
