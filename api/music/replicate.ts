import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from '../_lib/auth'
import { logGeneration, refundReservedCredit, reserveCredit } from '../_lib/credits'
import { getEnv } from '../_lib/env'
import { allowMethods, getJsonBody, sendError, validateOrigin } from '../_lib/http'

type MusicRequest = {
  lyrics: string
  style?: string
  model?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return
  if (!validateOrigin(req, res)) return

  let reserved:
    | {
        userId: string
        creditsBefore: number
        creditsAfter: number
      }
    | null = null

  try {
    const user = await requireUser(req, res)
    if (!user) return

    const body = getJsonBody<MusicRequest>(req, 64_000)
    if (!body.lyrics?.trim()) {
      res.status(400).json({ error: 'Lyrics are required.' })
      return
    }

    const token = getEnv('REPLICATE_API_TOKEN')
    if (!token) {
      res.status(500).json({ error: 'REPLICATE_API_TOKEN is not configured.' })
      return
    }

    const creditResult = await reserveCredit(user.id)
    reserved = {
      userId: user.id,
      creditsBefore: creditResult.credits_before,
      creditsAfter: creditResult.credits_after,
    }

    const model = body.model?.trim() || 'minimax/music-2.6'
    const prompt = body.style?.trim() || 'cinematic pop, emotional, full song with vocals'
    const { endpoint, payload } =
      model === 'meta/musicgen'
        ? buildMusicGenRequest(prompt)
        : buildMiniMaxMusicRequest(model, prompt, body.lyrics)

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=5',
      },
      body: JSON.stringify(payload),
    })

    const data = await upstream.json().catch(() => ({}))
    if (!upstream.ok) {
      await refundReservedCredit(user.id)
      reserved = null
      res.status(502).json({ error: sanitiseReplicateError(data) })
      return
    }

    await logGeneration(user.id, 'replicate', model, creditResult.credits_before)
    reserved = null

    // minimax/music-2.6 returns output as a string URL (not an array).
    // Keep the array check as a safe fallback for other models.
    const output = Array.isArray(data.output) ? data.output[0] : data.output
    res.status(200).json({
      audioUrl: typeof output === 'string' ? output : undefined,
      predictionUrl: data.urls?.get,
      creditsRemaining: creditResult.credits_after,
    })
  } catch (error) {
    if (reserved) {
      await refundReservedCredit(reserved.userId).catch(() => undefined)
    }
    if (error instanceof Error && error.name === 'NoCredits') {
      res.status(403).json({ error: 'No credits remaining' })
      return
    }
    sendError(res, error, 'Music generation failed.')
  }
}

function buildMiniMaxMusicRequest(model: string, prompt: string, lyrics: string) {
  return {
    endpoint: `https://api.replicate.com/v1/models/${model}/predictions`,
    payload: {
      input: {
        prompt,
        lyrics: lyrics.trim(),
        lyrics_optimizer: false,
        is_instrumental: false,
      },
    },
  }
}

function buildMusicGenRequest(prompt: string) {
  return {
    endpoint: 'https://api.replicate.com/v1/predictions',
    payload: {
      version:
        getEnv('REPLICATE_MUSICGEN_VERSION') ||
        'd1787b4764f6cac4cd0a3d34eea716c1f04e683abce64828e03133775a79fb1f',
      input: {
        prompt,
        duration: 30,
      },
    },
  }
}

function sanitiseReplicateError(data: unknown) {
  if (data && typeof data === 'object') {
    const detail = (data as { detail?: string; error?: string }).detail ?? (data as { error?: string }).error
    if (detail) return detail
  }
  return 'Replicate request failed.'
}
