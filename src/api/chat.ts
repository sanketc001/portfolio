// Client for the "Ask my portfolio" chat proxy (see chat-proxy/).
// The endpoint expects POST {messages:[{role,content}]} and answers with an
// OpenAI chat-completions SSE stream, or a plain JSON completion as a fallback.

export type ChatRole = 'user' | 'assistant'

export interface ChatTurn {
  role: ChatRole
  content: string
}

export const CHAT_ENDPOINT = ((import.meta.env.VITE_CHAT_ENDPOINT as string | undefined) || '').trim()

export const MAX_INPUT_CHARS = 1000
export const MAX_HISTORY = 10
const REQUEST_TIMEOUT_MS = 45_000

export class ChatError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ChatError'
    this.status = status
  }
}

/** Pull the text delta out of one SSE `data:` payload; null when it carries no text. */
export function parseSseData(payload: string): string | null {
  try {
    const json = JSON.parse(payload)
    const delta = json?.choices?.[0]?.delta?.content
    if (typeof delta === 'string') return delta
    // Some providers send the full message in the final chunk instead.
    const message = json?.choices?.[0]?.message?.content
    return typeof message === 'string' ? message : null
  } catch {
    return null
  }
}

function contentFromJson(data: unknown): string {
  const d = data as {
    choices?: { message?: { content?: unknown } }[]
    content?: unknown
    reply?: unknown
    answer?: unknown
    error?: unknown
  }
  const candidate = d?.choices?.[0]?.message?.content ?? d?.content ?? d?.reply ?? d?.answer
  if (typeof candidate === 'string' && candidate.trim()) return candidate
  const err = d?.error as { message?: unknown } | string | undefined
  const message = typeof err === 'string' ? err : typeof err?.message === 'string' ? err.message : 'Empty response'
  throw new ChatError(message)
}

/**
 * Send the conversation and stream the reply. `onDelta` receives each text
 * chunk as it arrives; the full reply is also returned.
 */
export async function streamChat(
  history: ChatTurn[],
  onDelta: (text: string) => void,
  externalSignal?: AbortSignal
): Promise<string> {
  if (!CHAT_ENDPOINT) throw new ChatError('Chat endpoint is not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onExternalAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', onExternalAbort)

  try {
    const messages = history
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_INPUT_CHARS) }))

    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream, application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal
    })

    const contentType = res.headers.get('content-type') || ''

    if (!res.ok) {
      let message = `Request failed (${res.status})`
      if (contentType.includes('application/json')) {
        try {
          const body = await res.json()
          if (typeof body?.error === 'string') message = body.error
          else if (typeof body?.error?.message === 'string') message = body.error.message
        } catch {
          // keep the generic message
        }
      }
      throw new ChatError(message, res.status)
    }

    // Non-streamed JSON fallback
    if (!contentType.includes('text/event-stream') || !res.body) {
      const text = contentFromJson(await res.json())
      onDelta(text)
      return text
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let full = ''
    let done = false

    while (!done) {
      const chunk = await reader.read()
      if (chunk.done) break
      buffer += decoder.decode(chunk.value, { stream: true })

      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)
        if (!line.startsWith('data:')) continue // comments, event:, id:, blank separators
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') {
          done = true
          break
        }
        const delta = parseSseData(payload)
        if (delta) {
          full += delta
          onDelta(delta)
        }
      }
    }
    reader.cancel().catch(() => {})

    if (!full.trim()) throw new ChatError('Empty response')
    return full
  } catch (error) {
    if (error instanceof ChatError) throw error
    if ((error as Error)?.name === 'AbortError') {
      throw new ChatError(externalSignal?.aborted ? 'Stopped' : 'The assistant took too long to answer')
    }
    throw new ChatError('Network error')
  } finally {
    clearTimeout(timeout)
    externalSignal?.removeEventListener('abort', onExternalAbort)
  }
}
