'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekDates, getWeekStartISO } from '@/lib/week'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const STARTER = ['Move my body', 'Plan tomorrow', 'Read or learn']

interface HabitRow {
  id: string
  name: string
  position: number
}

export default function HabitsPage() {
  const supabase = useMemo(() => createClient(), [])
  const weekDates = useMemo(() => getWeekDates(getWeekStartISO()), [])

  const [habits, setHabits] = useState<HabitRow[]>([])
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const nameSaveTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let { data: habitRows } = await supabase
        .from('habits')
        .select('id, name, position')
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      if (!habitRows || habitRows.length === 0) {
        const { data: seeded } = await supabase
          .from('habits')
          .insert(STARTER.map((name, position) => ({ user_id: user.id, name, position })))
          .select('id, name, position')
        habitRows = seeded ?? []
      }

      if (cancelled) return
      setHabits(habitRows)

      const habitIds = habitRows.map(h => h.id)
      if (habitIds.length === 0) return

      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_date')
        .in('habit_id', habitIds)
        .gte('completed_date', weekDates[0])
        .lte('completed_date', weekDates[6])

      if (cancelled) return

      const nextChecks: Record<string, boolean> = {}
      for (const log of logs ?? []) {
        const dayIndex = weekDates.indexOf(log.completed_date)
        if (dayIndex === -1) continue
        const habitIndex = habitRows.findIndex(h => h.id === log.habit_id)
        if (habitIndex === -1) continue
        nextChecks[`${habitIndex}-${dayIndex}`] = true
      }
      setChecks(nextChecks)
    }

    load()
    return () => { cancelled = true }
  }, [supabase, weekDates])

  function renameHabit(index: number, value: string) {
    setHabits(items => items.map((h, i) => i === index ? { ...h, name: value } : h))

    const habit = habits[index]
    if (!habit) return
    if (nameSaveTimeouts.current[habit.id]) clearTimeout(nameSaveTimeouts.current[habit.id])
    nameSaveTimeouts.current[habit.id] = setTimeout(async () => {
      await supabase.from('habits').update({ name: value }).eq('id', habit.id)
    }, 600)
  }

  async function toggleDay(habitIndex: number, dayIndex: number) {
    const habit = habits[habitIndex]
    if (!habit) return

    const key = `${habitIndex}-${dayIndex}`
    const wasChecked = !!checks[key]
    setChecks(v => ({ ...v, [key]: !wasChecked }))

    const completedDate = weekDates[dayIndex]
    if (wasChecked) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)
        .eq('completed_date', completedDate)
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habit.id, completed_date: completedDate })
    }
  }

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Consistency</p>
        <h1 className="text-3xl font-bold text-stone-900">Small habits, visible progress</h1>
        <p className="mt-1 text-stone-500">Track a few behaviors worth repeating instead of a long list you ignore.</p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="grid grid-cols-[1.7fr_repeat(7,.45fr)] gap-2 border-b border-stone-100 bg-stone-50 px-5 py-3 text-center text-xs font-semibold text-stone-400">
          <span className="text-left">Habit</span>{DAY_LABELS.map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}
        </div>
        {habits.map((habit, habitIndex) => (
          <div key={habit.id} className="grid grid-cols-[1.7fr_repeat(7,.45fr)] items-center gap-2 border-b border-stone-100 px-5 py-4 last:border-0">
            <input value={habit.name} onChange={e => renameHabit(habitIndex, e.target.value)} className="min-w-0 bg-transparent text-sm font-medium text-stone-800 outline-none" />
            {DAY_LABELS.map((day, dayIndex) => {
              const key = `${habitIndex}-${dayIndex}`
              return <button key={`${day}-${dayIndex}`} onClick={() => toggleDay(habitIndex, dayIndex)} className={`mx-auto h-7 w-7 rounded-lg border text-xs ${checks[key] ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-stone-200 bg-white text-transparent'}`}>✓</button>
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
