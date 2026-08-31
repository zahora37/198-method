'use client'

import { FormEvent, useState } from 'react'

type Message = { role: 'user' | 'assistant'; text: string; actions?: string[] }

const prompts = [
  'Plan my week',
  'What needs attention?',
  'Find time for something',
  'What is due this week?',
  'Where is my time going?',
  'Rebalance my week',
]

function responseFor(question: string): Message {
  const q = question.toLowerCase()
  if (q.includes('attention') || q.includes('focus')) return { role: 'assistant', text: 'Your first priorities are the overdue school form, vehicle registration due tomorrow, and certification study due this week. The first two fit into short openings today.', actions: ['View Focus', 'Find Time'] }
  if (q.includes('due')) return { role: 'assistant', text: 'You have several responsibilities coming up this week. Start with anything overdue, then handle vehicle registration before its due date. Track remains the full record of what is due.', actions: ['Open Track', 'View Focus'] }
  if (q.includes('time') || q.includes('schedule')) return { role: 'assistant', text: 'You have open time available this week. I can help compare the time needed for an item with your available windows. I will recommend a time first and will not change your schedule without your approval.', actions: ['View My 168', 'Find Time'] }
  if (q.includes('plan') || q.includes('week')) return { role: 'assistant', text: 'Start with fixed commitments, then protect time for the responsibilities that are due soon. Keep flexible blocks movable so the week can adjust when something changes.', actions: ['View My 168', 'View Focus'] }
  if (q.includes('going') || q.includes('168')) return { role: 'assistant', text: 'My 168 shows how your 168 weekly hours are allocated across fixed and flexible commitments. As your real schedule data grows, this view will explain which categories are using the most time and where capacity remains.', actions: ['View My 168'] }
  return { role: 'assistant', text: 'I can help with your schedule, responsibilities, available time, and priorities. Ask me what needs attention, what is due, or where something can fit into your week.', actions: ['View Focus', 'Open Track'] }
}

export default function Ask168Page() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  function ask(text: string) {
    const clean = text.trim()
    if (!clean) return
    setMessages((current) => [...current, { role: 'user', text: clean }, responseFor(clean)])
    setInput('')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    ask(input)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Support for planning and prioritizing.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Ask 168</h1>
        <p className="text-sm text-stone-500 mt-2">Ask about your time, responsibilities, or priorities.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        <section className="bg-white border border-stone-200 rounded-xl min-h-[580px] flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div>
                <h2 className="text-base font-semibold text-stone-900">How can 168 help?</h2>
                <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-6">Ask 168 is designed to work from your schedule, Track items, and Focus priorities. It recommends first. You approve changes second.</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="text-left border border-stone-200 rounded-lg p-4 text-sm font-medium text-stone-700 hover:border-stone-300 hover:bg-stone-50">{prompt}</button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div key={index} className={message.role === 'user' ? 'ml-auto max-w-[78%]' : 'max-w-[88%]'}>
                    <div className={message.role === 'user' ? 'bg-stone-900 text-white rounded-xl px-4 py-3 text-sm leading-6' : 'border-l-2 border-stone-300 pl-4 text-sm text-stone-700 leading-6'}>{message.text}</div>
                    {message.actions && <div className="flex flex-wrap gap-2 mt-3">{message.actions.map((action) => <button key={action} className="border border-stone-200 rounded-md px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">{action}</button>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-stone-200 p-4">
            <div className="border border-stone-300 rounded-lg p-2 flex gap-2 focus-within:border-stone-500">
              <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder="Ask about your week..." className="flex-1 px-3 py-2 text-sm outline-none bg-transparent text-stone-900 placeholder:text-stone-400" />
              <button type="submit" className="px-4 py-2 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">Send</button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="bg-white border border-stone-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-stone-900">What Ask 168 uses</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <p>My 168 schedule</p><p>Track responsibilities</p><p>Focus priorities</p><p>Fixed and flexible time</p><p>Time needed</p>
            </div>
          </section>
          <section className="bg-stone-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-stone-900">You stay in control</h2>
            <p className="text-sm text-stone-600 leading-6 mt-2">Ask 168 can recommend where something fits. It will not move fixed commitments, delete items, or change your schedule without approval.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
