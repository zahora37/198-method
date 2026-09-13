'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AREAS = ['Work', 'Health', 'Family', 'Growth']

export default function GoalsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [goals, setGoals] = useState<Record<string, string>>({})
  const [nextStep, setNextStep] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const saveTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('goals')
        .select('area, description, next_action')
        .eq('user_id', user.id)
        .in('area', AREAS)

      if (cancelled) return

      if (data) {
        const nextGoals: Record<string, string> = {}
        const nextSteps: Record<string, string> = {}
        for (const row of data) {
          if (!row.area) continue
          nextGoals[row.area] = row.description ?? ''
          nextSteps[row.area] = row.next_action ?? ''
        }
        setGoals(nextGoals)
        setNextStep(nextSteps)
      }
      setLoaded(true)
    }

    load()
    return () => { cancelled = true }
  }, [supabase])

  function saveArea(area: string, description: string, nextAction: string) {
    if (saveTimeouts.current[area]) clearTimeout(saveTimeouts.current[area])
    saveTimeouts.current[area] = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('goals').upsert(
        {
          user_id: user.id,
          name: area,
          area,
          description,
          next_action: nextAction,
        },
        { onConflict: 'user_id,area' }
      )
    }, 600)
  }

  function updateGoal(area: string, value: string) {
    setGoals(v => ({ ...v, [area]: value }))
    if (loaded) saveArea(area, value, nextStep[area] ?? '')
  }

  function updateNextStep(area: string, value: string) {
    setNextStep(v => ({ ...v, [area]: value }))
    if (loaded) saveArea(area, goals[area] ?? '', value)
  }

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Direction</p>
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
              <span className="h-3 w-3 rounded-full bg-indigo-500" />
            </div>
            <label className="text-xs font-medium text-stone-500">What do you want?</label>
            <textarea value={goals[area] ?? ''} onChange={e => updateGoal(area, e.target.value)} placeholder={`Your ${area.toLowerCase()} goal...`} className="mt-1 h-20 w-full resize-none rounded-xl bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="mt-4 block text-xs font-medium text-stone-500">Next scheduled action</label>
            <input value={nextStep[area] ?? ''} onChange={e => updateNextStep(area, e.target.value)} placeholder="One action for this week" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </section>
        ))}
      </div>
    </div>
  )
}
