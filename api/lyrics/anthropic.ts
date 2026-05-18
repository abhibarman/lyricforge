import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from '../_lib/auth'
import { getEnv } from '../_lib/env'
import { allowMethods, getJsonBody, sendError, validateOrigin } from '../_lib/http'

type LyricsRequest = {
  idea: string
  model?: string
  systemPrompt?: string
  options?: {
    genre?: string
    moods?: string[]
    structure?: string
    language?: string
    verseCount?: number
    includeOutro?: boolean
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return
  if (!validateOrigin(req, res)) return

  try {
    const user = await requireUser(req, res)
    if (!user) return

    const body = getJsonBody<LyricsRequest>(req, 32_000)
    if (!body.idea?.trim()) {
      res.status(400).json({ error: 'Idea is required.' })
      return
    }

    const apiKey = getEnv('ANTHROPIC_API_KEY')
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured.' })
      return
    }

    const requestedModel = body.model?.trim()
    const fallbackModel = getEnv('ANTHROPIC_MODEL') || 'claude-sonnet-4-5-20250929'
    let model = requestedModel || fallbackModel
    let response = await callAnthropic({ apiKey, model, body })

    let data = await response.json().catch(() => ({}))
    if (!response.ok && requestedModel && requestedModel !== fallbackModel && isModelNotFound(data)) {
      model = fallbackModel
      response = await callAnthropic({ apiKey, model, body })
      data = await response.json().catch(() => ({}))
    }

    if (!response.ok) {
      res.status(502).json({ error: sanitiseAnthropicError(data) })
      return
    }

    const lyrics = data.content
      ?.filter((item: { type: string }) => item.type === 'text')
      .map((item: { text: string }) => item.text)
      .join('\n')
      .trim()

    res.status(200).json({ lyrics, provider: 'anthropic', model })
  } catch (error) {
    sendError(res, error, 'Lyrics generation failed.')
  }
}

function callAnthropic({
  apiKey,
  model,
  body,
}: {
  apiKey: string
  model: string
  body: LyricsRequest
}) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.85,
      system:
        body.systemPrompt ||
        'You are LyricForge. Write polished, original song lyrics with bracketed section headers.',
      messages: [{ role: 'user', content: buildLyricsPrompt(body) }],
    }),
  })
}

function buildLyricsPrompt(body: LyricsRequest) {
  const options = body.options ?? {}
  return [
    'Write complete song lyrics for this idea.',
    `Idea: ${body.idea}`,
    `Genre/style: ${options.genre || 'open'}`,
    `Mood: ${options.moods?.join(', ') || 'open'}`,
    `Structure: ${options.structure || 'Verse-Chorus-Bridge'}`,
    `Language: ${options.language || 'English'}`,
    `Verse count: ${options.verseCount ?? 2}`,
    `Include outro: ${options.includeOutro ? 'yes' : 'no'}`,
    '',
    'Return only lyrics. Use bracketed section headers like [Verse 1], [Chorus], and [Bridge].',
  ].join('\n')
}

function sanitiseAnthropicError(data: unknown) {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: { message?: string } }).error
    return error?.message ?? 'Anthropic request failed.'
  }
  return 'Anthropic request failed.'
}

function isModelNotFound(data: unknown) {
  if (!data || typeof data !== 'object' || !('error' in data)) return false
  const error = (data as { error?: { type?: string; message?: string } }).error
  return error?.type === 'not_found_error' && error.message?.includes('model:')
}
