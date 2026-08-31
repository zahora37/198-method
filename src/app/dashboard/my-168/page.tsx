'use client'

import { useMemo, useState } from 'react'

type TimeBlock = {
  id: number
  title: string
  day: string
  start: string
  end: string
  category: string
  type: 'Fixed' | 'Flexible'
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM']

const initialBlocks: TimeBlock[] = [
  { id: 1, title: 'Work', day: 'Mon', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 2, title: 'Work', day: 'Tue', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 3, title: 'Work', day: 'Wed', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 4, title: 'Work', day: 'Thu', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 5, title: 'Work', day: 'Fri', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 6, title: 'Workout', day: 'Mon', start: '6 PM', end: '7 PM', category: 'Health', type: 'Flexible' },
  { id: 7, title: 'Workout', day: 'Wed', start: '6 PM', end: '7 PM', category: 'Health', type: 'Flexible' },
  { id: 8, title: 'Family Time', day: 'Sun', start: '1 PM', end: '4 PM', category: 'Family', type: 'Fixed' },
]

function durationInHours(start: string, end: string) {
  const to24 = (value: string) => {
    const [rawHour, period] = value.split(' ')
    let hour = Number(rawHour)
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
    return hour
  }

  return Math.max(to24(end) - to24(start), 0)
}

export default function My168Page() {
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    day: 'Mon',
    start: '8 AM',
    end: '9 AM',
    category: 'Personal',
    type: 'Flexible' as 'Fixed' | 'Flexible',
  })

  const planned = useMemo(() => blocks.reduce((sum, block) => sum + durationInHours(block.start, block.end), 0), [blocks])
  const available = Math.max(168 - planned, 0)

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    blocks.forEach((block) => {
      totals[block.category] = (totals[block.category] || 0) + durationInHours(block.start, block.end)
    })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [blocks])

  function addBlock() {
    if (!form.title.trim()) return

    setBlocks((current) => [
      ...current,
      {
        id: Date.now(),
        title: form.title.trim(),
        day: form.day,
        start: form.start,
        end: form.end,
        category: form.category,
        type: form.type,
      },
    ])

    setForm({ title: '', day: 'Mon', start: '8 AM', end: '9 AM', category: 'Personal', type: 'Flexible' })
    setShowForm(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-stone-500">Plan your time.</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">My 168</h1>
          <p className="mt-2 text-sm text-stone-500">Aug 30 - Sep 5</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-600 hover:bg-stone-50">Previous</button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-medium text-stone-900 hover:bg-stone-50">This Week</button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-600 hover:bg-stone-50">Next</button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="grid sm:grid-cols-3 border border-stone-200 rounded-lg overflow-hidden">
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Total</p>
              <p className="text-3xl font-semibold text-stone-900 mt-2">168</p>
              <p className="text-xs text-stone-500 mt-1">hours</p>
            </div>
            <div className="p-5 sm:border-l border-stone-200">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Planned</p>
              <p className="text-3xl font-semibold text-stone-900 mt-2">{planned}</p>
              <p className="text-xs text-stone-500 mt-1">hours</p>
            </div>
            <div className="p-5 sm:border-l border-stone-200">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Available</p>
              <p className="text-3xl font-semibold text-stone-900 mt-2">{available}</p>
              <p className="text-xs text-stone-500 mt-1">hours</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full bg-stone-900" style={{ width: `${Math.min((planned / 168) * 100, 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-stone-500">
            <span>{planned} planned</span>
            <span>{available} available</span>
          </div>
        </div>

        <aside className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Time Breakdown</h2>
            <span className="text-xs text-stone-400">This week</span>
          </div>
          <div className="mt-4 divide-y divide-stone-100">
            {categoryTotals.length === 0 ? (
              <p className="py-4 text-sm text-stone-400">No planned time yet.</p>
            ) : (
              categoryTotals.map(([category, hours]) => (
                <div key={category} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-stone-600">{category}</span>
                  <span className="font-medium text-stone-900">{hours}h</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Weekly Schedule</h2>
            <p className="text-sm text-stone-500 mt-1">Use fixed time for commitments that should not move. Use flexible time for activities that can be rescheduled.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">
            Add Time
          </button>
        </div>

        {showForm && (
          <div className="border-b border-stone-200 bg-stone-50 p-5">
            <div className="grid gap-4 md:grid-cols-6">
              <label className="md:col-span-2 text-xs font-medium text-stone-600">
                Activity
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Activity name"
                  className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400"
                />
              </label>

              <label className="text-xs font-medium text-stone-600">
                Day
                <select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                  {DAYS.map((day) => <option key={day}>{day}</option>)}
                </select>
              </label>

              <label className="text-xs font-medium text-stone-600">
                Start
                <select value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                  {HOURS.map((hour) => <option key={hour}>{hour}</option>)}
                </select>
              </label>

              <label className="text-xs font-medium text-stone-600">
                End
                <select value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                  {HOURS.map((hour) => <option key={hour}>{hour}</option>)}
                </select>
              </label>

              <label className="text-xs font-medium text-stone-600">
                Type
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as 'Fixed' | 'Flexible' })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                  <option>Fixed</option>
                  <option>Flexible</option>
                </select>
              </label>

              <label className="md:col-span-2 text-xs font-medium text-stone-600">
                Category
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                  {['Sleep', 'Work', 'Family', 'Health', 'Home', 'Personal', 'Education', 'Social', 'Other'].map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>

              <div className="md:col-span-4 flex items-end justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Cancel</button>
                <button onClick={addBlock} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">Save</button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-stone-200 bg-stone-50">
              <div className="p-3 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="border-l border-stone-200 p-3 text-center text-sm font-medium text-stone-700">{day}</div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-stone-100 last:border-b-0">
                <div className="p-3 text-xs text-stone-400">{hour}</div>
                {DAYS.map((day) => {
                  const items = blocks.filter((block) => block.day === day && block.start === hour)
                  return (
                    <div key={`${day}-${hour}`} className="min-h-16 border-l border-stone-100 p-1.5">
                      {items.map((block) => (
                        <div key={block.id} className={`rounded-md border px-2.5 py-2 text-xs ${block.type === 'Fixed' ? 'border-stone-300 bg-stone-100 text-stone-800' : 'border-stone-200 bg-white text-stone-700'}`}>
                          <p className="font-medium">{block.title}</p>
                          <p className="mt-1 text-[11px] text-stone-500">{block.start} - {block.end}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-stone-400">{block.type}</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-stone-900">Unscheduled</h2>
          <p className="mt-1 text-sm text-stone-500">Items from Track that need time will appear here.</p>
          <div className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
            {[
              ['Vehicle registration', '20 min'],
              ['Grocery shopping', '1 hr'],
              ['Call insurance', '15 min'],
            ].map(([item, time]) => (
              <div key={item} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-stone-800">{item}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{time}</p>
                </div>
                <button className="text-xs font-medium text-stone-700 hover:text-stone-900">Schedule</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-stone-900">Planning Rules</h2>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
              <span>Fixed time</span>
              <span className="text-right text-stone-500">Commitments that should not move</span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
              <span>Flexible time</span>
              <span className="text-right text-stone-500">Activities that may be rescheduled</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span>Weekly capacity</span>
              <span className="text-right text-stone-500">168 hours maximum</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
