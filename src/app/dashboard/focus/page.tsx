'use client'

import { useMemo, useState } from 'react'

type FocusItem = {
  id: number
  title: string
  dueLabel: string
  minutes: number
  priority: 'Important' | 'Normal'
  scheduled: boolean
  overdue?: boolean
  reason: string
  bucket: 'Today' | 'This Week' | 'Later'
}

const INITIAL_ITEMS: FocusItem[] = [
  {
    id: 1,
    title: 'Submit school form',
    dueLabel: 'Overdue by 1 day',
    minutes: 10,
    priority: 'Important',
    scheduled: false,
    overdue: true,
    reason: 'Overdue and quick to complete',
    bucket: 'Today',
  },
  {
    id: 2,
    title: 'Vehicle registration',
    dueLabel: 'Due tomorrow',
    minutes: 20,
    priority: 'Important',
    scheduled: false,
    reason: 'Due soon and fits your available time',
    bucket: 'Today',
  },
  {
    id: 3,
    title: 'Certification study',
    dueLabel: 'Due this week',
    minutes: 60,
    priority: 'Normal',
    scheduled: false,
    reason: 'Important progress item with enough time available',
    bucket: 'This Week',
  },
  {
    id: 4,
    title: 'Insurance renewal review',
    dueLabel: 'Due in 4 days',
    minutes: 15,
    priority: 'Normal',
    scheduled: false,
    reason: 'Upcoming responsibility that can be handled quickly',
    bucket: 'This Week',
  },
  {
    id: 5,
    title: 'Garage organization',
    dueLabel: 'No hard deadline',
    minutes: 180,
    priority: 'Normal',
    scheduled: false,
    reason: 'Lower urgency and needs a larger time block',
    bucket: 'Later',
  },
]

const MINUTES_AVAILABLE_TODAY = 75

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours} hr`
}

export default function FocusPage() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [message, setMessage] = useState('')

  const ranked = useMemo(() => {
    return [...items].sort((a, b) => {
      const score = (item: FocusItem) =>
        (item.overdue ? 100 : 0) +
        (item.priority === 'Important' ? 40 : 0) +
        (item.bucket === 'Today' ? 30 : item.bucket === 'This Week' ? 15 : 0) +
        (item.minutes <= MINUTES_AVAILABLE_TODAY ? 10 : 0) -
        item.minutes / 30
      return score(b) - score(a)
    })
  }, [items])

  const topThree = ranked.slice(0, 3)
  const overdueCount = items.filter((item) => item.overdue).length
  const upcomingCount = items.filter((item) => !item.overdue && item.bucket !== 'Later').length
  const quickTasks = ranked.filter((item) => item.minutes <= 15 && item.bucket !== 'Later').slice(0, 3)

  function moveItem(id: number, bucket: FocusItem['bucket'], label: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, bucket } : item))
    setMessage(label)
  }

  function scheduleItem(item: FocusItem) {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, scheduled: true, bucket: 'Today' } : entry))
    setMessage(`${item.title} is marked for today. My 168 scheduling will connect here next.`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Know what to focus on.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Focus</h1>
        <p className="text-sm text-stone-500 mt-2">What needs your attention.</p>
      </header>

      {message && (
        <div className="bg-stone-100 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700">
          {message}
        </div>
      )}

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-stone-200">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Needs Attention</h2>
            <p className="text-sm text-stone-500 mt-1">3 need attention - {upcomingCount} upcoming - {overdueCount} overdue</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Available today</p>
            <p className="text-xl font-semibold text-stone-900 mt-1">{formatMinutes(MINUTES_AVAILABLE_TODAY)}</p>
          </div>
        </div>

        <ol className="divide-y divide-stone-100">
          {topThree.map((item, index) => (
            <li key={item.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-sm font-semibold text-stone-700 flex-shrink-0">{index + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                      {item.priority === 'Important' && <span className="text-xs border border-stone-300 rounded px-2 py-0.5 text-stone-600">Important</span>}
                      {item.scheduled && <span className="text-xs bg-stone-900 text-white rounded px-2 py-0.5">Today</span>}
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{item.dueLabel} - {formatMinutes(item.minutes)}</p>
                    <p className="text-xs text-stone-400 mt-2">Why this is here: {item.reason}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button onClick={() => scheduleItem(item)} className="px-3 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">Schedule</button>
                  <button onClick={() => moveItem(item.id, 'Today', `${item.title} kept in focus for today.`)} className="px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-700 hover:bg-stone-50">Later Today</button>
                  <button onClick={() => moveItem(item.id, 'This Week', `${item.title} moved to this week.`)} className="px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-700 hover:bg-stone-50">This Week</button>
                  <button onClick={() => moveItem(item.id, 'Later', `${item.title} moved to later.`)} className="px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-700 hover:bg-stone-50">Later</button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {(['Today', 'This Week', 'Later'] as const).map((bucket) => {
          const bucketItems = ranked.filter((item) => item.bucket === bucket)
          return (
            <div key={bucket} className="bg-white border border-stone-200 rounded-xl p-5 min-h-[220px]">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <h2 className="text-sm font-semibold text-stone-900">{bucket}</h2>
                <span className="text-xs text-stone-400">{bucketItems.length}</span>
              </div>
              <div className="divide-y divide-stone-100">
                {bucketItems.length === 0 ? (
                  <p className="text-sm text-stone-400 py-4">Nothing here right now.</p>
                ) : bucketItems.map((item) => (
                  <div key={item.id} className="py-4">
                    <p className="text-sm font-medium text-stone-800">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-1">{item.dueLabel} - {formatMinutes(item.minutes)}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Quick Tasks</h2>
            <p className="text-sm text-stone-500 mt-1">Small items that can fit into short openings.</p>
          </div>
          <p className="text-sm text-stone-500">15 minutes or less</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {quickTasks.map((item) => (
            <button key={item.id} onClick={() => scheduleItem(item)} className="text-left border border-stone-200 rounded-lg p-4 hover:bg-stone-50">
              <p className="text-sm font-medium text-stone-900">{item.title}</p>
              <p className="text-xs text-stone-500 mt-1">{formatMinutes(item.minutes)} - {item.dueLabel}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
