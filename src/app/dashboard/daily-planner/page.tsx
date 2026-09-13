'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/week'

const BLOCKS = ['Morning', 'Midday', 'Afternoon', 'Evening']

export default function DailyPlannerPage() {
  const supabase = useMemo(() => createClient(), [])
  const date = useMemo(() => todayISO(), [])

  const [planId, setPlanId] = useState<string | null>(null)
  const [topThree, setTopThree] = useState(['', '', ''])
  const [blocks, setBlocks] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [loaded, setLoaded] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (cancelled) return

      if (data) {
        setPlanId(data.id)
        setTopThree(Array.isArray(data.top_three) && data.top_three.length === 3 ? data.top_three : ['', '', ''])
        setBlocks(data.blocks ?? {})
        setNotes(data.notes ?? '')
      }
      setLoaded(true)
    }

    load()
    return () => { cancelled = true }
  }, [supabase, date])

  useEffect(() => {
    if (!loaded) return

    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('daily_plans')
        .upsert(
          {
            id: planId ?? undefined,
            user_id: user.id,
            date,
            top_three: topThree,
            blocks,
            notes,
          },
          { onConflict: 'user_id,date' }
        )
        .select('id')
        .single()

      if (!error && data && !planId) setPlanId(data.id)
    }, 600)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topThree, blocks, notes, loaded])

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Today</p>
        <h1 className="text-3xl font-bold text-stone-900">Plan a day that fits your week</h1>
        <p className="mt-1 text-stone-500">Pick three wins, protect time for them, and leave room for the unexpected.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-2xl bg-stone-900 p-6 text-white">
          <p className="text-sm font-semibold">Today’s top 3</p>
          <p className="mb-5 text-sm text-stone-400">Finish these before adding more.</p>
          <div className="space-y-3">
            {topThree.map((item, index) => (
              <div key={index} className="flex gap-3 rounded-xl bg-white/10 p-3">
                <span className="font-bold text-indigo-300">0{index + 1}</span>
                <input value={item} onChange={e => setTopThree(items => items.map((v, i) => i === index ? e.target.value : v))} placeholder="What matters today?" className="w-full bg-transparent text-sm outline-none placeholder:text-stone-500" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Time blocks</h2>
          <p className="mb-5 text-sm text-stone-500">Plan by energy and commitments, not minute by minute.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOCKS.map(block => (
              <div key={block} className="rounded-xl border border-stone-200 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">{block}</p>
                <textarea value={blocks[block] ?? ''} onChange={e => setBlocks(value => ({ ...value, [block]: e.target.value }))} placeholder="Focus, meetings, family, health..." className="h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-stone-300" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Capture, do not carry</h2>
        <p className="mb-3 text-sm text-stone-500">Park reminders and ideas here instead of holding them in your head.</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Calls, errands, ideas, follow-ups..." className="h-28 w-full resize-none rounded-xl bg-stone-50 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
      </section>
    </div>
  )
}
