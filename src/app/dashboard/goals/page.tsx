'use client'

import { useState } from 'react'

const AREAS = ['Work', 'Health', 'Family', 'Growth']

export default function GoalsPage() {
  const [goals, setGoals] = useState<Record<string, string>>({})
  const [nextStep, setNextStep] = useState<Record<string, string>>({})

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Direction</p>
        <h1 className="text-3xl font-bold text-stone-900">Goals that earn time on your calendar</h1>
        <p className="mt-1 text-stone-500">Turn each goal into one next action you can schedule this week.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {AREAS.map((area, index) => (
          <section key={area} className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Area 0{index + 1}</p>
                <h2 className="text-xl font-bold text-stone-900">{area}</h2>
              </div>
              <span className="h-3 w-3 rounded-full bg-brand-500" />
            </div>
            <label className="text-xs font-medium text-stone-500">What do you want?</label>
            <textarea value={goals[area] ?? ''} onChange={e => setGoals(v => ({ ...v, [area]: e.target.value }))} placeholder={`Your ${area.toLowerCase()} goal...`} className="mt-1 h-20 w-full resize-none rounded-xl bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            <label className="mt-4 block text-xs font-medium text-stone-500">Next scheduled action</label>
            <input value={nextStep[area] ?? ''} onChange={e => setNextStep(v => ({ ...v, [area]: e.target.value }))} placeholder="One action for this week" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </section>
        ))}
      </div>
    </div>
  )
}
