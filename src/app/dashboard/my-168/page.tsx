'use client'

import { useEffect, useMemo, useState } from 'react'

type TimeBlock = {
  id: number
  title: string
  day: string
  start: string
  end: string
  category: string
  type: 'Fixed' | 'Fluid'
}

type Palette = Record<string, string>

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM']
const CATEGORIES = ['Sleep', 'Work', 'Family', 'Health', 'Home', 'Personal', 'Education', 'Social', 'Other']
const COLORS = [
  { name: 'Lavender', value: '#ddd6fe' },
  { name: 'Sage', value: '#d1fae5' },
  { name: 'Powder Blue', value: '#dbeafe' },
  { name: 'Soft Rose', value: '#fce7f3' },
  { name: 'Peach', value: '#ffedd5' },
  { name: 'Sand', value: '#f5f0e6' },
  { name: 'Mint', value: '#ccfbf1' },
  { name: 'Butter', value: '#fef3c7' },
  { name: 'Lilac', value: '#f3e8ff' },
]

const DEFAULT_COLORS: Palette = {
  Sleep: '#ddd6fe', Work: '#dbeafe', Family: '#fce7f3', Health: '#d1fae5', Home: '#fef3c7', Personal: '#f3e8ff', Education: '#ccfbf1', Social: '#ffedd5', Other: '#f5f0e6'
}

const initialBlocks: TimeBlock[] = [
  { id: 1, title: 'Work', day: 'Mon', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 2, title: 'Work', day: 'Tue', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 3, title: 'Work', day: 'Wed', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 4, title: 'Work', day: 'Thu', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 5, title: 'Work', day: 'Fri', start: '8 AM', end: '5 PM', category: 'Work', type: 'Fixed' },
  { id: 6, title: 'Workout', day: 'Mon', start: '6 PM', end: '7 PM', category: 'Health', type: 'Fluid' },
  { id: 7, title: 'Workout', day: 'Wed', start: '6 PM', end: '7 PM', category: 'Health', type: 'Fluid' },
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
  const [showColors, setShowColors] = useState(false)
  const [categoryColors, setCategoryColors] = useState<Palette>(DEFAULT_COLORS)
  const [form, setForm] = useState({ title: '', day: 'Mon', start: '8 AM', end: '9 AM', category: 'Personal', type: 'Fluid' as 'Fixed' | 'Fluid' })

  useEffect(() => {
    const saved = localStorage.getItem('168-category-colors')
    if (saved) {
      try { setCategoryColors({ ...DEFAULT_COLORS, ...JSON.parse(saved) }) } catch { }
    }
  }, [])

  const planned = useMemo(() => blocks.reduce((sum, block) => sum + durationInHours(block.start, block.end), 0), [blocks])
  const available = Math.max(168 - planned, 0)
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    blocks.forEach(block => { totals[block.category] = (totals[block.category] || 0) + durationInHours(block.start, block.end) })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [blocks])

  function addBlock() {
    if (!form.title.trim() || durationInHours(form.start, form.end) <= 0) return
    setBlocks(current => [...current, { id: Date.now(), ...form, title: form.title.trim() }])
    setForm({ title: '', day: 'Mon', start: '8 AM', end: '9 AM', category: 'Personal', type: 'Fluid' })
    setShowForm(false)
  }

  function setColor(category: string, color: string) {
    const next = { ...categoryColors, [category]: color }
    setCategoryColors(next)
    localStorage.setItem('168-category-colors', JSON.stringify(next))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-stone-500">Plan your time with intention.</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">My 168</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Start with the commitments that already own part of your week. Fixed blocks stay in place. Fluid blocks matter, but can move when life changes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setShowColors(value => !value)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-medium text-stone-700 hover:bg-stone-50">Customize Colors</button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-600 hover:bg-stone-50">Previous</button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-medium text-stone-900 hover:bg-stone-50">This Week</button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-600 hover:bg-stone-50">Next</button>
        </div>
      </header>

      {showColors && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Your color key</p>
            <h2 className="text-lg font-semibold text-stone-900 mt-1">Choose what each color means</h2>
            <p className="text-sm text-stone-500 mt-2 leading-6">Color should help you recognize your week at a glance. Choose a pastel color for each category. Fixed and Fluid are shown by border style, so category color and flexibility stay separate.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {CATEGORIES.map(category => (
              <label key={category} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 text-sm">
                <span className="flex items-center gap-2 min-w-0"><span className="w-4 h-4 rounded-full border border-black/5 shrink-0" style={{ backgroundColor: categoryColors[category] }} /><span className="font-medium text-stone-700">{category}</span></span>
                <select value={categoryColors[category]} onChange={e => setColor(category, e.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-600">
                  {COLORS.map(color => <option key={color.name} value={color.value}>{color.name}</option>)}
                </select>
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="grid sm:grid-cols-3 border border-stone-200 rounded-lg overflow-hidden">
            {[['Total', 168], ['Planned', planned], ['Available', available]].map(([label, value], index) => (
              <div key={String(label)} className={`p-5 ${index ? 'sm:border-l border-stone-200' : ''}`}><p className="text-xs uppercase tracking-[0.14em] text-stone-400">{label}</p><p className="text-3xl font-semibold text-stone-900 mt-2">{value}</p><p className="text-xs text-stone-500 mt-1">hours</p></div>
            ))}
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-stone-900" style={{ width: `${Math.min((planned / 168) * 100, 100)}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-stone-500"><span>{planned} planned</span><span>{available} available</span></div>
        </div>

        <aside className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-stone-900">Time Breakdown</h2><span className="text-xs text-stone-400">This week</span></div>
          <div className="mt-4 divide-y divide-stone-100">
            {categoryTotals.map(([category, hours]) => <div key={category} className="flex items-center justify-between py-3 text-sm"><span className="flex items-center gap-2 text-stone-600"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[category] }} />{category}</span><span className="font-medium text-stone-900">{hours}h</span></div>)}
          </div>
        </aside>
      </section>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Weekly Schedule</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-stone-500">
              <span className="flex items-center gap-2"><span className="w-7 h-4 rounded border-2 border-stone-500 bg-stone-50" />Fixed - should not move</span>
              <span className="flex items-center gap-2"><span className="w-7 h-4 rounded border-2 border-dashed border-stone-400 bg-stone-50" />Fluid - can be moved</span>
            </div>
          </div>
          <button onClick={() => setShowForm(value => !value)} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">{showForm ? 'Close' : 'Add Time'}</button>
        </div>

        {showForm && (
          <div className="border-b border-stone-200 bg-stone-50 p-5">
            <p className="text-sm text-stone-600 mb-4">Add one block of time. Choose Fixed when the commitment cannot easily move. Choose Fluid when it can be rescheduled within the week.</p>
            <div className="grid gap-4 md:grid-cols-6">
              <label className="md:col-span-2 text-xs font-medium text-stone-600">Activity<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Activity name" className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-stone-600">Day<select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">{DAYS.map(day => <option key={day}>{day}</option>)}</select></label>
              <label className="text-xs font-medium text-stone-600">Start<select value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">{HOURS.map(hour => <option key={hour}>{hour}</option>)}</select></label>
              <label className="text-xs font-medium text-stone-600">End<select value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">{HOURS.map(hour => <option key={hour}>{hour}</option>)}</select></label>
              <label className="text-xs font-medium text-stone-600">Type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'Fixed' | 'Fluid' })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"><option>Fixed</option><option>Fluid</option></select></label>
              <label className="md:col-span-2 text-xs font-medium text-stone-600">Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
              <div className="md:col-span-4 flex items-end justify-end gap-2"><button onClick={() => setShowForm(false)} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">Cancel</button><button onClick={addBlock} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">Save</button></div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-stone-200 bg-stone-50"><div className="p-3 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">Time</div>{DAYS.map(day => <div key={day} className="border-l border-stone-200 p-3 text-center text-sm font-medium text-stone-700">{day}</div>)}</div>
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-stone-100 last:border-b-0">
                <div className="p-3 text-xs text-stone-400">{hour}</div>
                {DAYS.map(day => {
                  const items = blocks.filter(block => block.day === day && block.start === hour)
                  return <div key={`${day}-${hour}`} className="min-h-16 border-l border-stone-100 p-1.5">{items.map(block => <div key={block.id} className={`rounded-lg px-2.5 py-2 text-xs border-2 ${block.type === 'Fluid' ? 'border-dashed border-stone-400' : 'border-solid border-stone-500'}`} style={{ backgroundColor: categoryColors[block.category] }}><p className="font-medium text-stone-900">{block.title}</p><p className="mt-1 text-[11px] text-stone-600">{block.start} - {block.end}</p><p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-stone-500">{block.category} · {block.type}</p></div>)}</div>
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-stone-200 rounded-xl p-5"><h2 className="text-sm font-semibold text-stone-900">Unscheduled</h2><p className="mt-1 text-sm text-stone-500">Track items that need time will eventually appear here so you can place them into your week.</p><div className="mt-4 divide-y divide-stone-100 border-t border-stone-100">{[['Vehicle registration', '20 min'], ['Grocery shopping', '1 hr'], ['Call insurance', '15 min']].map(([item, time]) => <div key={item} className="flex items-center justify-between py-3 text-sm"><div><p className="font-medium text-stone-800">{item}</p><p className="text-xs text-stone-500 mt-0.5">{time}</p></div><button className="text-xs font-medium text-stone-700">Schedule</button></div>)}</div></div>
        <div className="bg-white border border-stone-200 rounded-xl p-5"><h2 className="text-sm font-semibold text-stone-900">Planning Rules</h2><div className="mt-4 space-y-3 text-sm text-stone-600"><div className="flex justify-between gap-4 border-b border-stone-100 pb-3"><span>Fixed</span><span className="text-right text-stone-500">Work, appointments, school, meetings, flights</span></div><div className="flex justify-between gap-4"><span>Fluid</span><span className="text-right text-stone-500">Workouts, errands, cleaning, study, personal projects</span></div></div></div>
      </section>
    </div>
  )
}
