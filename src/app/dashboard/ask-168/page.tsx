'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Send, Sparkles, Loader2, Lock } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What should I focus on today?',
  'Where is my time actually going?',
  'Help me plan a calmer week',
]

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [locked, setLocked] = useState(false)
  const [signInRequired, setSignInRequired] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setInput('')
    setBusy(true)
    const history: Message[] = [...messages, { role: 'user' as const, content: trimmed }]
    setMessages([...history, { role: 'assistant' as const, content: '' }])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      if (res.status === 403) {
        setLocked(true)
        setMessages((m) => m.slice(0, -1))
        return
      }
      if (res.status === 401) {
        setSignInRequired(true)
        setMessages((m) => m.slice(0, -1))
        return
      }
      if (!res.ok || !res.body) {
        const result = await res.json().catch(() => ({}))
        throw new Error(result.error || 'Ask 168 could not answer right now.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const payload = JSON.parse(line.slice(5))
          if (payload.text) {
            const token = payload.text as string
            setMessages((m) => {
              const copy = [...m]
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: copy[copy.length - 1].content + token,
              }
              return copy
            })
          }
          if (payload.error) {
            setMessages((m) => {
              const copy = [...m]
              copy[copy.length - 1] = { role: 'assistant', content: payload.error as string }
              return copy
            })
          }
        }
      }
    } catch (error) {
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Ask 168 could not answer right now.',
        }
        return copy
      })
    } finally {
      setBusy(false)
    }
  }

  if (signInRequired) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Sign in to use Ask 168</h1>
        <p className="text-stone-500 mb-6">Ask 168 reads your saved schedule and responsibilities.</p>
        <Link href="/login" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700">Sign in</Link>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Ask 168 is a Pro feature</h1>
        <p className="text-stone-500 mb-6">
          Upgrade to ask practical questions about your time, with answers based on your actual week.
        </p>
        <Link
          href="/api/stripe/checkout?plan=pro"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Coach</p>
        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-2">
          Ask 168 <Sparkles className="w-6 h-6 text-brand-500" />
        </h1>
        <p className="mt-1 text-stone-500">
          Practical answers about your time, based on the week you have entered so far.
        </p>
      </div>

      <div className="flex-1 space-y-4 mb-6">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-sm font-medium text-stone-700 mb-3">Try asking…</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={busy}
                  className="text-sm border border-stone-200 rounded-full px-4 py-2 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-stone-900 text-white rounded-br-md'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-md'
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        {busy && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="sticky bottom-4 flex gap-2 bg-white border border-stone-200 rounded-2xl p-2 shadow-sm"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your week…"
          className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-stone-400"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
