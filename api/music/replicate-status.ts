import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from '../_lib/auth.js'
import { getEnv } from '../_lib/env.js'
import { allowMethods, sendError, validateOrigin } from '../_lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return
  if (!validateOrigin(req, res)) return

  try {
    if (!(await requireUser(req, res))) return

    const predictionId = getPredictionId(req)
    if (!predictionId) {
      res.status(400).json({ error: 'Prediction id is required.' })
      return
    }

    const token = getEnv('REPLICATE_API_TOKEN')
    if (!token) {
      res.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured.' })
      return
    }

    const upstream = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      res.status(502).json({ error: sanitiseReplicateError(data) })
      return
    }

    res.status(200).json({
      id: data.id,
      status: data.status,
      error: data.error,
      audioUrl: extractAudioUrl(data.output),
    })
  } catch (error) {
    sendError(res, error, 'Could not check Replicate prediction status.')
  }
}

function getPredictionId(req: VercelRequest) {
  const value = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  if (!value || !/^[a-zA-Z0-9_-]+$/.test(value)) return null
  return value
}

function extractAudioUrl(output: unknown): string | undefined {
  if (typeof output === 'string') return output
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractAudioUrl(item)
      if (url) return url
    }
  }
  if (output && typeof output === 'object') {
    const record = output as Record<string, unknown>
    for (const key of ['audio', 'url', 'music', 'file', 'output']) {
      const value = record[key]
      const url = extractAudioUrl(value)
      if (url) return url
    }
  }
  return undefined
}

function sanitiseReplicateError(data: unknown) {
  if (data && typeof data === 'object') {
    const detail = (data as { detail?: string; error?: string }).detail ?? (data as { error?: string }).error
    if (detail) return detail
  }
  return 'Replicate status request failed.'
}
