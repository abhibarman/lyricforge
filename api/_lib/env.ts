import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let localEnv: Record<string, string> | null = null

export function getEnv(name: string) {
  return process.env[name] ?? getLocalEnv()[name]
}

function getLocalEnv() {
  if (localEnv) return localEnv

  localEnv = {}
  try {
    const text = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separator = trimmed.indexOf('=')
      if (separator === -1) continue
      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '')
      localEnv[key] = value
    }
  } catch {
    // Vercel production uses real environment variables, not .env.local.
  }

  return localEnv
}
