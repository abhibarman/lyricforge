import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { User } from '@supabase/supabase-js'
import { createServiceClient } from './supabase.js'

export async function requireUser(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: 'Unauthenticated' })
    return null
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid session' })
    return null
  }

  return data.user
}
