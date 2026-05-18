import type { LyricsSection } from '../types'

export function parseLyrics(raw: string): LyricsSection[] {
  const text = raw.trim()
  if (!text) return []

  const matches = [...text.matchAll(/^\s*\[([^\]]+)\]\s*$/gm)]
  if (matches.length === 0) {
    return [{ id: crypto.randomUUID(), title: 'Lyrics', body: text }]
  }

  return matches.map((match, index) => {
    const next = matches[index + 1]
    const start = (match.index ?? 0) + match[0].length
    const end = next?.index ?? text.length
    return {
      id: crypto.randomUUID(),
      title: match[1].trim(),
      body: text.slice(start, end).trim(),
    }
  })
}

export function serializeLyrics(sections: LyricsSection[]) {
  return sections.map((section) => `[${section.title}]\n${section.body.trim()}`).join('\n\n')
}

export function countWords(text: string) {
  const words = text.trim().match(/\S+/g)
  return words?.length ?? 0
}
