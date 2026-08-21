'use client'

import { useState } from 'react'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const STARTER = ['Move my body', 'Plan tomorrow', 'Read or learn']

export default function HabitsPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [habits, setHabits] = useState(STARTER)

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Consistency</p>
        <h1 className="text-3xl font-bold text-stone-900">Small habits, visible progress</h1>
        <p className="mt-1 text-stone-500">Track a few behaviors worth repeating instead of a long list you ignore.</p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="grid grid-cols-[1.7fr_repeat(7,.45fr)] gap-2 border-b border-stone-100 bg-stone-50 px-5 py-3 text-center text-xs font-semibold text-stone-400">
          <span className="text-left">Habit</span>{DAYS.map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}
        </div>
        {habits.map((habit, habitIndex) => (
          <div key={habitIndex} className="grid grid-cols-[1.7fr_repeat(7,.45fr)] items-center gap-2 border-b border-stone-100 px-5 py-4 last:border-0">
            <input value={habit} onChange={e => setHabits(items => items.map((v, i) => i === habitIndex ? e.target.value : v))} className="min-w-0 bg-transparent text-sm font-medium text-stone-800 outline-none" />
            {DAYS.map((day, dayIndex) => {
              const key = `${habitIndex}-${dayIndex}`
              return <button key={`${day}-${dayIndex}`} onClick={() => setChecks(v => ({ ...v, [key]: !v[key] }))} className={`mx-auto h-7 w-7 rounded-lg border text-xs ${checks[key] ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-stone-200 bg-white text-transparent'}`}>✓</button>
            })}
          </div>
        ))}
      </section>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-900">
        Aim for consistency, not a perfect seven-day streak. Your system should survive busy weeks.
      </div>
    </div>
  )
}
