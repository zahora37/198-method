'use client'

import { useState } from 'react'

const PROMPTS = [
  ['Wins', 'What went well this week?'],
  ['Time leaks', 'Where did time disappear without giving you much back?'],
  ['Energy', 'What gave you energy? What drained it?'],
  ['Next week', 'What will you protect or change next week?'],
]

export default function ReviewPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [score, setScore] = useState(7)

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Reset</p>
        <h1 className="text-3xl font-bold text-stone-900">Close the week before starting another</h1>
        <p className="mt-1 text-stone-500">Keep what worked. Adjust what did not. Start the next 168 hours with evidence.</p>
      </div>

      <section className="rounded-2xl bg-stone-900 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm text-stone-400">How aligned did this week feel?</p><p className="text-4xl font-bold">{score}<span className="text-lg text-stone-500">/10</span></p></div>
          <input type="range" min="1" max="10" value={score} onChange={e => setScore(Number(e.target.value))} className="w-full sm:w-72" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {PROMPTS.map(([title, prompt]) => (
          <section key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-stone-900">{title}</h2>
            <p className="mb-3 text-sm text-stone-500">{prompt}</p>
            <textarea value={answers[title] ?? ''} onChange={e => setAnswers(v => ({ ...v, [title]: e.target.value }))} placeholder="Write a few honest lines..." className="h-28 w-full resize-none rounded-xl bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </section>
        ))}
      </div>
    </div>
  )
}
