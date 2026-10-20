import React from 'react'

// Minimal, safe markdown for chat answers. Model output is never injected as
// HTML: everything is rendered as React text nodes, so it is escaped by React.
// Supported: paragraphs, line breaks, - / * / 1. lists, # headings (as bold),
// **bold**, `code`, [links](https://...) and bare http(s) URLs.

const INLINE_PATTERN = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g

function safeHref(url: string): string | null {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed
  return null
}

const linkClass = 'text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-500 break-words'

function renderInline(text: string, keyPrefix = 'i'): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0
  let index = 0
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const token = match[0]
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const key = `${keyPrefix}-${index++}`

    if (token.startsWith('**')) {
      nodes.push(<strong key={key} className="font-semibold">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="px-1 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[0.85em] font-mono">
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
      const href = m ? safeHref(m[2]) : null
      nodes.push(
        href && m ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {m[1]}
          </a>
        ) : (
          token
        )
      )
    } else {
      const href = safeHref(token)
      nodes.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {token}
          </a>
        ) : (
          token
        )
      )
    }
    last = start + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

type Block =
  | { type: 'p'; lines: string[] }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'h'; text: string }
  | { type: 'code'; text: string }

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++])
      i++ // closing fence (or end of a still-streaming block)
      blocks.push({ type: 'code', text: code.join('\n') })
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const heading = /^\s{0,3}#{1,6}\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({ type: 'h', text: heading[1] })
      i++
      continue
    }
    const bullet = /^\s*[-*•]\s+(.*)$/
    const numbered = /^\s*\d+[.)]\s+(.*)$/
    if (bullet.test(line) || numbered.test(line)) {
      const type = bullet.test(line) ? 'ul' : 'ol'
      const re = type === 'ul' ? bullet : numbered
      const items: string[] = []
      while (i < lines.length && re.test(lines[i])) {
        const item = (re.exec(lines[i]) as RegExpExecArray)[1]
        if (item.trim()) items.push(item) // skip an empty bullet that is still streaming
        i++
      }
      blocks.push({ type, items })
      continue
    }
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i]) &&
      !/^\s{0,3}#{1,6}\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i++])
    }
    blocks.push({ type: 'p', lines: para })
  }
  return blocks
}

export const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = parseBlocks(text)
  return (
    <div className="space-y-2">
      {blocks.map((block, b) => {
        const key = `b${b}`
        switch (block.type) {
          case 'h':
            return (
              <p key={key} className="font-bold">
                {renderInline(block.text, key)}
              </p>
            )
          case 'code':
            return (
              <pre key={key} className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-900 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {block.text}
              </pre>
            )
          case 'ul':
          case 'ol': {
            const List = block.type
            return (
              <List key={key} className={`${block.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-5 space-y-1`}>
                {block.items.map((item, n) => (
                  <li key={n}>{renderInline(item, `${key}-${n}`)}</li>
                ))}
              </List>
            )
          }
          default:
            return (
              <p key={key}>
                {block.lines.map((line, n) => (
                  <React.Fragment key={n}>
                    {n > 0 && <br />}
                    {renderInline(line, `${key}-${n}`)}
                  </React.Fragment>
                ))}
              </p>
            )
        }
      })}
    </div>
  )
}
