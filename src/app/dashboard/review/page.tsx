'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStartISO } from '@/lib/week'

const PROMPTS: [string, string][] = [
  ['Wins', 'What went well this week?'],
  ['Time leaks', 'Where did time disappear without giving you much back?'],
  ['Energy', 'What gave you energy? What drained it?'],
  ['Next week', 'What will you protect or change next week?'],
]

const FIELD_BY_TITLE: Record<string, 'what_worked' | 'time_reflection' | 'what_didnt' | 'next_change'> = {
  'Wins': 'what_worked',
  'Time leaks': 'time_reflection',
  'Energy': 'what_didnt',
  'Next week': 'next_change',
}

export default function ReviewPage() {
  const supabase = useMemo(() => createClient(), [])
  const weekOf = useMemo(() => getWeekStartISO(), [])

  const [reviewId, setReviewId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [score, setScore] = useState(7)
  const [loaded, setLoaded] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_of', weekOf)
        .maybeSingle()

      if (cancelled) return

      if (data) {
        setReviewId(data.id)
        const nextAnswers: Record<string, string> = {}
        for (const [title] of PROMPTS) {
          nextAnswers[title] = data[FIELD_BY_TITLE[title]] ?? ''
        }
        setAnswers(nextAnswers)
        setScore(data.alignment_score ?? 7)
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

      const fields: Record<string, string> = {}
      for (const [title] of PROMPTS) {
        fields[FIELD_BY_TITLE[title]] = answers[title] ?? ''
      }

      const { data, error } = await supabase
        .from('weekly_reviews')
        .upsert(
          {
            id: reviewId ?? undefined,
            user_id: user.id,
            week_of: weekOf,
            alignment_score: score,
            ...fields,
          },
          { onConflict: 'user_id,week_of' }
        )
        .select('id')
        .single()

      if (!error && data && !reviewId) setReviewId(data.id)
    }, 600)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, score, loaded])

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Reset</p>
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
            <textarea value={answers[title] ?? ''} onChange={e => setAnswers(v => ({ ...v, [title]: e.target.value }))} placeholder="Write a few honest lines..." className="h-28 w-full resize-none rounded-xl bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </section>
        ))}
      </div>
    </div>
  )
}
