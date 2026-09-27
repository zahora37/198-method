'use client'

import { ChangeEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, FileUp, Loader2, Lock, Send, X } from 'lucide-react'

type Action = { label: string; href: string }
type ScheduleItem = { title: string; date: string; startTime: string; endTime: string; category: string; blockType: 'Fixed' | 'Fluid' }
type Message = { role: 'user' | 'assistant'; content: string; actions?: Action[]; scheduleItems?: ScheduleItem[] }
type Attachment = { name: string; type: string; data: string }

const SUGGESTIONS = ['What needs my attention today?', 'Find time for an overdue item', 'Help me make this week lighter']

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [locked, setLocked] = useState(false)
  const [signInRequired, setSignInRequired] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [fileError, setFileError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileError('')
    if (file.size > 5_000_000 || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Choose a PDF, JPG, PNG, or WebP under 5 MB.')
      return
    }
    const result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
      reader.onerror = () => reject(new Error('File could not be read'))
      reader.readAsDataURL(file)
    }).catch(() => '')
    if (!result) { setFileError('The file could not be read.'); return }
    setAttachment({ name: file.name, type: file.type, data: result })
    if (!input.trim()) setInput('Read this school or holiday schedule and prepare the dated items for My 168.')
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    const userMessage: Message = { role: 'user', content: trimmed }
    const history = [...messages.map(({ role, content }) => ({ role, content })), userMessage]
    setMessages(current => [...current, userMessage])
    setInput('')
    setBusy(true)
    setSaveMessage('')
    try {
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, attachment }) })
      if (res.status === 403) { setLocked(true); return }
      if (res.status === 401) { setSignInRequired(true); return }
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Ask 168 could not answer right now.')
      const remainingHeader = res.headers.get('X-Ask-168-Remaining')
      if (remainingHeader !== null) setRemaining(Number(remainingHeader))
      const scheduleItems: ScheduleItem[] = (result.scheduleItems || []).map((item: Omit<ScheduleItem, 'startTime' | 'endTime'> & { startTime: string | null; endTime: string | null }) => ({ ...item, startTime: item.startTime || '', endTime: item.endTime || '' }))
      setMessages(current => [...current, { role: 'assistant', content: result.reply, actions: result.actions || [], scheduleItems }])
      setAttachment(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (error) {
      setMessages(current => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Ask 168 could not answer right now.' }])
    } finally { setBusy(false) }
  }

  function updateSchedule(messageIndex: number, itemIndex: number, field: keyof ScheduleItem, value: string) {
    setMessages(current => current.map((message, index) => index !== messageIndex ? message : {
      ...message,
      scheduleItems: message.scheduleItems?.map((item, scheduleIndex) => scheduleIndex === itemIndex ? { ...item, [field]: value } : item),
    }))
  }

  async function addSchedule(items: ScheduleItem[]) {
    setSaveMessage('Adding to My 168...')
    const res = await fetch('/api/ask/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) })
    const result = await res.json().catch(() => ({}))
    setSaveMessage(res.ok ? `Added ${result.added} item${result.added === 1 ? '' : 's'} to My 168.` : result.error || 'The schedule could not be added.')
  }

  if (signInRequired) return <Gate title="Sign in to use Ask 168" text="Ask 168 reads your saved schedule and responsibilities." href="/login" label="Sign in" />
  if (locked) return <Gate title="Ask 168 is a Pro feature" text="Pro includes 100 Ask 168 questions each month." href="/api/stripe/checkout?plan=pro" label="Upgrade to Pro" locked />

  return <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Plan and act</p>
      <h1 className="mt-1 text-3xl font-bold text-stone-900">Ask 168</h1>
      <p className="mt-2 text-sm text-stone-500">Get a short next step, then open the right part of your app.</p>
      {remaining !== null && <p className="mt-2 text-xs text-stone-400">{remaining} questions left this month</p>}
    </header>

    <div className="mb-6 flex-1 space-y-4">
      {messages.length === 0 && <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">{SUGGESTIONS.map(suggestion => <button key={suggestion} onClick={() => void send(suggestion)} className="rounded-full border border-stone-200 px-4 py-2 text-sm hover:border-brand-300 hover:bg-brand-50">{suggestion}</button>)}</div>
        <button onClick={() => fileRef.current?.click()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-4 text-sm font-medium text-stone-600 hover:border-brand-400 hover:bg-brand-50"><FileUp className="h-4 w-4" />Upload a school or holiday calendar</button>
      </section>}

      {messages.map((message, messageIndex) => <div key={messageIndex} className={message.role === 'user' ? 'flex justify-end' : ''}>
        <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-800'}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.actions && message.actions.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{message.actions.map(action => <Link key={action.href} href={action.href} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white">{action.label}</Link>)}</div>}
        </div>
        {message.scheduleItems && message.scheduleItems.length > 0 && <section className="mt-3 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="mb-4"><h2 className="font-semibold text-stone-900">Review before adding</h2><p className="mt-1 text-xs text-stone-500">Check every date and add times where the document did not include them.</p></div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">{message.scheduleItems.map((item, itemIndex) => <div key={`${item.date}-${itemIndex}`} className="grid gap-2 rounded-xl bg-stone-50 p-3 sm:grid-cols-[1.4fr_1fr_.8fr_.8fr]">
            <input value={item.title} onChange={event => updateSchedule(messageIndex, itemIndex, 'title', event.target.value)} aria-label="Event title" className="rounded-lg border border-stone-200 px-2 py-2 text-sm" />
            <input type="date" value={item.date} onChange={event => updateSchedule(messageIndex, itemIndex, 'date', event.target.value)} aria-label="Event date" className="rounded-lg border border-stone-200 px-2 py-2 text-sm" />
            <input type="time" value={item.startTime} onChange={event => updateSchedule(messageIndex, itemIndex, 'startTime', event.target.value)} aria-label="Start time" className="rounded-lg border border-stone-200 px-2 py-2 text-sm" />
            <input type="time" value={item.endTime} onChange={event => updateSchedule(messageIndex, itemIndex, 'endTime', event.target.value)} aria-label="End time" className="rounded-lg border border-stone-200 px-2 py-2 text-sm" />
          </div>)}</div>
          <button disabled={message.scheduleItems.some(item => !item.startTime || !item.endTime)} onClick={() => void addSchedule(message.scheduleItems || [])} className="mt-4 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"><CalendarPlus className="h-4 w-4" />Add all to My 168</button>
        </section>}
      </div>)}
      {busy && <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500"><Loader2 className="h-4 w-4 animate-spin" />Organizing your next step...</div>}
      {saveMessage && <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{saveMessage}</p>}
    </div>

    {attachment && <div className="mb-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-900"><span className="truncate">{attachment.name}</span><button onClick={() => setAttachment(null)} aria-label="Remove file"><X className="h-4 w-4" /></button></div>}
    {fileError && <p className="mb-2 text-xs text-red-700">{fileError}</p>}
    <form onSubmit={event => { event.preventDefault(); void send(input) }} className="sticky bottom-4 flex gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
      <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={chooseFile} className="hidden" />
      <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload schedule" className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-600"><FileUp className="h-4 w-4" /></button>
      <input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about your time..." disabled={busy} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
      <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
    </form>
  </div>
}

function Gate({ title, text, href, label, locked = false }: { title: string; text: string; href: string; label: string; locked?: boolean }) {
  return <div className="mx-auto max-w-xl py-20 text-center">{locked && <Lock className="mx-auto mb-4 h-7 w-7 text-brand-600" />}<h1 className="text-2xl font-bold text-stone-900">{title}</h1><p className="my-4 text-stone-500">{text}</p><Link href={href} className="inline-block rounded-xl bg-brand-600 px-6 py-3 font-medium text-white">{label}</Link></div>
}
