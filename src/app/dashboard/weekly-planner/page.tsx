'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStartISO } from '@/lib/week'
import type { Priority } from '@/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_PRIORITIES: Priority[] = [
  { id: '1', text: '', done: false },
  { id: '2', text: '', done: false },
  { id: '3', text: '', done: false },
]

export default function WeeklyPlannerPage() {
  const supabase = useMemo(() => createClient(), [])
  const weekOf = useMemo(() => getWeekStartISO(), [])

  const [planId, setPlanId] = useState<string | null>(null)
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES)
  const [focus, setFocus] = useState('')
  const [dayPlans, setDayPlans] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_of', weekOf)
        .maybeSingle()

      if (cancelled) return

      if (data) {
        setPlanId(data.id)
        setPriorities(
          Array.isArray(data.top_priorities) && data.top_priorities.length
            ? data.top_priorities
            : DEFAULT_PRIORITIES
        )
        setFocus(data.focus ?? '')
        setDayPlans(data.day_plans ?? {})
      }
      setLoaded(true)
    }

    load()
    return () => { cancelled = true }
  }, [supabase, weekOf])

  useEffect(() => {
    if (!loaded) return

    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('weekly_plans')
        .upsert(
          {
            id: planId ?? undefined,
            user_id: user.id,
            week_of: weekOf,
            top_priorities: priorities,
            focus,
            day_plans: dayPlans,
          },
          { onConflict: 'user_id,week_of' }
        )
        .select('id')
        .single()

      if (!error && data && !planId) setPlanId(data.id)
    }, 600)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorities, focus, dayPlans, loaded])

  const completed = useMemo(() => priorities.filter(p => p.done && p.text.trim()).length, [priorities])

  return (
    <div className="space-y-7 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">168 Method</p>
          <h1 className="text-3xl font-bold text-stone-900">Design your week</h1>
          <p className="text-stone-500 mt-1">Choose what deserves your time before the week chooses for you.</p>
        </div>
        <div className="rounded-2xl bg-stone-900 px-5 py-3 text-white">
          <p className="text-xs text-stone-400">Top priorities complete</p>
          <p className="text-2xl font-bold">{completed}/3</p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-semibold text-stone-900">Your 3 outcomes</p>
          <p className="mb-5 text-sm text-stone-500">If these happen, the week counts.</p>
          <div className="space-y-3">
            {priorities.map((priority, index) => (
              <div key={priority.id} className="flex items-center gap-3 rounded-xl border border-stone-200 p-3">
                <button
                  onClick={() => setPriorities(items => items.map(p => p.id === priority.id ? { ...p, done: !p.done } : p))}
                  className={`h-6 w-6 rounded-full border text-xs ${priority.done ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-stone-300'}`}
                >
                  {priority.done ? '✓' : index + 1}
                </button>
                <input
                  value={priority.text}
                  onChange={e => setPriorities(items => items.map(p => p.id === priority.id ? { ...p, text: e.target.value } : p))}
                  placeholder={`Priority ${index + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <p className="text-sm font-semibold text-indigo-950">Weekly intention</p>
          <p className="mb-4 text-sm text-indigo-700">What do you want this week to feel focused on?</p>
          <textarea
            value={focus}
            onChange={e => setFocus(e.target.value)}
            placeholder="Example: Finish the important work early and protect family evenings."
            className="h-36 w-full resize-none rounded-xl border border-indigo-100 bg-white p-4 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-stone-900">Seven-day map</h2>
            <p className="text-sm text-stone-500">Give each day one main focus.</p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">168 hours total</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map(day => (
            <div key={day} className="rounded-2xl border border-stone-200 bg-white p-4 last:lg:col-span-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">{day}</p>
              <textarea
                value={dayPlans[day] ?? ''}
                onChange={e => setDayPlans(plans => ({ ...plans, [day]: e.target.value }))}
                placeholder="Main focus, appointments, or protected time..."
                className="h-24 w-full resize-none bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-300"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-stone-900 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Weekly rule</p>
        <p className="mt-2 text-xl font-semibold">Do not fill every hour. Protect margin for life.</p>
      </div>
    </div>
  )
}
