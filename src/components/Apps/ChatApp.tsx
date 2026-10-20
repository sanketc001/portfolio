import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Square, Mail, RotateCcw, Sparkles } from 'lucide-react'
import portfolioData from '../../data/portfolioData.json'
import { CHAT_ENDPOINT, MAX_INPUT_CHARS, ChatError, streamChat } from '../../api/chat'
import type { ChatTurn } from '../../api/chat'
import { Markdown } from '../../utils/markdown'
import { prefersReducedMotion } from '../../tour'

const SUGGESTED_QUESTIONS = [
  'What has Sanket built with LLM agents?',
  "Walk me through ParsedIn's architecture",
  'What did he do at Quest Global / Jio?',
  'Is he open to FDE roles?'
]

// Messages kept on screen; the request itself only carries the last 10.
const MAX_VISIBLE = 20

interface UiMessage extends ChatTurn {
  id: number
  status: 'done' | 'streaming' | 'fallback'
}

interface ChatAppProps {
  onOpenContact?: () => void
}

export const ChatApp: React.FC<ChatAppProps> = ({ onOpenContact }) => {
  const { profile } = portfolioData
  const firstName = profile.name.split(' ')[0]
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const available = Boolean(CHAT_ENDPOINT)

  // Stop any in-flight request when the window closes.
  useEffect(() => () => abortRef.current?.abort(), [])

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const streaming = messages.some(m => m.status === 'streaming')
    el.scrollTo({ top: el.scrollHeight, behavior: streaming || prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages])

  const updateMessage = (id: number, patch: (m: UiMessage) => Partial<UiMessage>) =>
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...patch(m) } : m)))

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT_CHARS)
    if (!text || busy) return

    const userMsg: UiMessage = { id: nextId.current++, role: 'user', content: text, status: 'done' }
    const replyId = nextId.current++
    const history: ChatTurn[] = [...messages.filter(m => m.status === 'done'), userMsg].map(({ role, content }) => ({ role, content }))

    setInput('')

    if (!available) {
      setMessages(prev =>
        [
          ...prev,
          userMsg,
          {
            id: replyId,
            role: 'assistant' as const,
            status: 'fallback' as const,
            content: `The live assistant isn't connected right now, so I can't answer that here. The quickest way to get an answer is to ask ${firstName} directly.`
          }
        ].slice(-MAX_VISIBLE)
      )
      return
    }

    setMessages(prev => [...prev, userMsg, { id: replyId, role: 'assistant' as const, content: '', status: 'streaming' as const }].slice(-MAX_VISIBLE))
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat(history, delta => updateMessage(replyId, m => ({ content: m.content + delta })), controller.signal)
      updateMessage(replyId, () => ({ status: 'done' }))
    } catch (error) {
      const stopped = error instanceof ChatError && error.message === 'Stopped'
      updateMessage(replyId, m =>
        stopped && m.content
          ? { status: 'done', content: `${m.content} …` }
          : {
              status: 'fallback',
              content:
                error instanceof ChatError && error.status === 429
                  ? `Lots of questions right now, so the assistant is pausing for a few minutes. You can also reach ${firstName} directly.`
                  : `Sorry, the assistant couldn't answer just now. You can reach ${firstName} directly instead.`
            }
      )
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send(input)
    }
  }

  const contactButtons = (
    <div className="flex flex-wrap gap-2 mt-3">
      {onOpenContact && (
        <button
          type="button"
          onClick={onOpenContact}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
        >
          Open Contact
        </button>
      )}
      <a
        href={`mailto:${profile.email}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
      >
        <Mail className="w-3.5 h-3.5" />
        <span>{profile.email}</span>
      </a>
    </div>
  )

  return (
    <div className="h-full flex flex-col select-text">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3 bg-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white font-display">Ask my portfolio</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Questions about {firstName}'s projects, experience and availability
            </p>
          </div>
        </div>
        {messages.length > 0 && !busy && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer whitespace-nowrap flex-shrink-0"
            title="Start a new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>
        )}
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4" role="log" aria-live="polite" aria-label="Conversation">
        {!available && messages.length === 0 && (
          <div className="p-4 rounded-xl border border-amber-300/50 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-500/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-bold text-slate-800 dark:text-white">The live assistant is offline right now.</p>
            <p className="mt-1">
              You can still browse the suggested questions, but for a real answer please get in touch with {firstName} directly.
            </p>
            {contactButtons}
          </div>
        )}

        {messages.length === 0 && (
          <div className="pt-2">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                Hi! I answer questions about {firstName}'s work: his projects, experience, skills and availability. Try one of these:
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 sm:pl-9">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-left px-3.5 py-2.5 rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/15 text-xs font-semibold text-violet-700 dark:text-violet-300 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-violet-600 text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] min-w-0 px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                {m.status === 'streaming' && !m.content ? (
                  <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  </span>
                ) : m.status === 'fallback' ? (
                  <>
                    <p>{m.content}</p>
                    {contactButtons}
                  </>
                ) : (
                  <Markdown text={m.content} />
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
            onKeyDown={handleKeyDown}
            maxLength={MAX_INPUT_CHARS}
            rows={1}
            placeholder={`Ask about ${firstName}'s work…`}
            aria-label="Your question"
            className="flex-1 resize-none max-h-32 min-h-[40px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="h-10 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              aria-label="Stop generating"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400/50 disabled:cursor-not-allowed text-white inline-flex items-center justify-center cursor-pointer"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
          <span>Answers are generated from my portfolio and may be imperfect.</span>
          {input.length > MAX_INPUT_CHARS * 0.8 && (
            <span className="tabular-nums">
              {input.length}/{MAX_INPUT_CHARS}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
