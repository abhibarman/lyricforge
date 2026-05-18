import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getEnv } from './env'

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]) {
  if (req.method && methods.includes(req.method)) return true
  res.setHeader('Allow', methods.join(', '))
  res.status(405).json({ error: 'Method not allowed' })
  return false
}

export function validateOrigin(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (!origin) return true

  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return true
  }

  const allowedOrigins = new Set(
    [
      process.env.PUBLIC_APP_URL,
      getEnv('PUBLIC_APP_URL'),
      getEnv('VITE_PUBLIC_APP_URL'),
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean),
  )

  if (allowedOrigins.has(origin)) return true
  res.status(403).json({ error: 'Unexpected request origin.' })
  return false
}

export function getJsonBody<T>(req: VercelRequest, maxBytes: number): T {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const size = Buffer.byteLength(JSON.stringify(body ?? {}), 'utf8')
  if (size > maxBytes) {
    const error = new Error('Payload too large.')
    error.name = 'PayloadTooLarge'
    throw error
  }
  return body as T
}

export function sendError(res: VercelResponse, error: unknown, fallback = 'Request failed.') {
  const message = error instanceof Error ? error.message : fallback
  const status = error instanceof Error && error.name === 'PayloadTooLarge' ? 413 : 500
  res.status(status).json({ error: message })
}
