export interface DescriptionBlock {
  /** A heading line (followed by bullets) or a plain paragraph when there are no bullets. */
  heading?: string
  bullets: string[]
}

/**
 * Parses an experience description into blocks. Lines starting with "•" are
 * bullets (several "•" on one line are split); other lines start a new block;
 * blank lines end the current block.
 */
export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = []
  let current: DescriptionBlock | null = null
  for (const raw of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) {
      current = null
      continue
    }
    if (line.startsWith('•')) {
      if (!current) {
        current = { bullets: [] }
        blocks.push(current)
      }
      current.bullets.push(...line.split('•').map(s => s.trim()).filter(Boolean))
    } else {
      current = { heading: line, bullets: [] }
      blocks.push(current)
    }
  }
  return blocks
}
