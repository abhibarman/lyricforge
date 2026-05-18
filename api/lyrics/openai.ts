import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from '../_lib/auth.js'
import { getEnv } from '../_lib/env.js'
import { allowMethods, getJsonBody, sendError, validateOrigin } from '../_lib/http.js'

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

    const apiKey = getEnv('OPENAI_API_KEY')
    if (!apiKey) {
      res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' })
      return
    }

    const model = body.model?.trim() || getEnv('OPENAI_MODEL') || 'gpt-5.4-mini'
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 1800,
        instructions:
          body.systemPrompt ||
          'You are LyricForge. Write polished, original song lyrics with bracketed section headers.',
        input: buildLyricsPrompt(body),
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      res.status(502).json({ error: sanitiseOpenAIError(data) })
      return
    }

    res.status(200).json({
      lyrics: extractOutputText(data),
      provider: 'openai',
      model,
    })
  } catch (error) {
    sendError(res, error, 'Lyrics generation failed.')
  }
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

function extractOutputText(data: unknown) {
  if (data && typeof data === 'object' && 'output_text' in data) {
    const outputText = (data as { output_text?: unknown }).output_text
    if (typeof outputText === 'string') return outputText.trim()
  }

  const output = (data as { output?: Array<{ content?: Array<{ text?: string }> }> })?.output
  return (
    output
      ?.flatMap((item) => item.content ?? [])
      .map((item) => item.text)
      .filter(Boolean)
      .join('\n')
      .trim() ?? ''
  )
}

function sanitiseOpenAIError(data: unknown) {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: { message?: string } }).error
    return error?.message ?? 'OpenAI request failed.'
  }
  return 'OpenAI request failed.'
}
