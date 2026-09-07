'use client'

import { useMemo, useState } from 'react'

type Stage = 'Inbox' | 'This Week' | 'In Progress' | 'Done'
type TrackItem = {
  id: number
  title: string
  category: string
  due: string
  repeat: string
  timeNeeded: string
  priority: 'Normal' | 'Important'
  status: 'Upcoming' | 'Overdue' | 'Completed'
  stage: Stage
  autoPay: boolean
  notes: string
  lastCompleted?: string
}

const starterItems: TrackItem[] = [
  { id: 1, title: 'Electric bill', category: 'Finance', due: '2026-09-02', repeat: 'Monthly', timeNeeded: '5 min', priority: 'Normal', status: 'Upcoming', stage: 'This Week', autoPay: true, notes: '' },
  { id: 2, title: 'School event', category: 'Family', due: '2026-09-04', repeat: 'Does not repeat', timeNeeded: '2 hr', priority: 'Important', status: 'Upcoming', stage: 'This Week', autoPay: false, notes: '' },
  { id: 3, title: 'Subscription renewal', category: 'Subscription', due: '2026-09-07', repeat: 'Monthly', timeNeeded: '', priority: 'Normal', status: 'Upcoming', stage: 'Inbox', autoPay: true, notes: '' },
  { id: 4, title: 'Vehicle registration', category: 'Vehicle', due: '2026-09-10', repeat: 'Yearly', timeNeeded: '20 min', priority: 'Important', status: 'Upcoming', stage: 'In Progress', autoPay: false, notes: '' },
]

const categories = ['Finance', 'Subscription', 'Home', 'Vehicle', 'Family', 'Health', 'Work', 'School', 'Personal', 'Other']
const repeats = ['Does not repeat', 'Weekly', 'Monthly', 'Every 3 months', 'Every 6 months', 'Yearly', 'Custom']
const stages: Stage[] = ['Inbox', 'This Week', 'In Progress', 'Done']

export default function TrackPage() {
  const [items, setItems] = useState<TrackItem[]>(starterItems)
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Overdue' | 'Completed'>('All')
  const [view, setView] = useState<'List' | 'Board'>('List')
  const [showForm, setShowForm] = useState(false)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', category: 'Personal', due: '', repeat: 'Does not repeat', timeNeeded: '', priority: 'Normal' as 'Normal' | 'Important', autoPay: false, notes: '' })

  const today = new Date('2026-08-30T12:00:00')
  const enriched = useMemo(() => items.map(item => {
    if (item.stage === 'Done' || item.status === 'Completed') return { ...item, status: 'Completed' as const, stage: 'Done' as const }
    const due = new Date(`${item.due}T12:00:00`)
    return { ...item, status: due < today ? 'Overdue' as const : 'Upcoming' as const }
  }), [items])

  const counts = useMemo(() => {
    const sevenDays = new Date(today); sevenDays.setDate(today.getDate() + 7)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return {
      overdue: enriched.filter(i => i.status === 'Overdue').length,
      week: enriched.filter(i => i.status !== 'Completed' && new Date(`${i.due}T12:00:00`) >= today && new Date(`${i.due}T12:00:00`) <= sevenDays).length,
      month: enriched.filter(i => i.status !== 'Completed' && new Date(`${i.due}T12:00:00`) >= today && new Date(`${i.due}T12:00:00`) <= monthEnd).length,
      later: enriched.filter(i => i.status !== 'Completed' && new Date(`${i.due}T12:00:00`) > monthEnd).length,
    }
  }, [enriched])

  const visibleItems = enriched.filter(item => filter === 'All' ? true : item.status === filter).sort((a, b) => a.due.localeCompare(b.due))

  function addItem() {
    if (!form.title.trim() || !form.due) return
    setItems(current => [...current, { id: Date.now(), title: form.title.trim(), category: form.category, due: form.due, repeat: form.repeat, timeNeeded: form.timeNeeded.trim(), priority: form.priority, status: 'Upcoming', stage: 'Inbox', autoPay: form.autoPay, notes: form.notes.trim() }])
    setForm({ title: '', category: 'Personal', due: '', repeat: 'Does not repeat', timeNeeded: '', priority: 'Normal', autoPay: false, notes: '' })
    setShowForm(false)
  }

  function moveItem(id: number, stage: Stage) {
    setItems(current => current.map(item => item.id === id ? { ...item, stage, status: stage === 'Done' ? 'Completed' : 'Upcoming', lastCompleted: stage === 'Done' ? 'Aug 30, 2026' : undefined } : item))
  }

  function markComplete(id: number) { moveItem(id, 'Done') }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-sm text-stone-500">Remember what matters and move it forward.</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Track</h1>
          <p className="text-sm text-stone-500 mt-2 max-w-2xl leading-6">Track is for anything you do not want to keep in your head. Add the responsibility once, give it a due date, and decide when it needs your attention.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">{showForm ? 'Close' : 'Add Item'}</button>
      </header>

      {showForm && (
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-5"><h2 className="font-semibold text-stone-900">Add something you need to remember</h2><p className="text-sm text-stone-500 mt-1">Start with what it is and when it is due. Repeat, time needed, and notes help 168 understand it later.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-sm text-stone-600 lg:col-span-2">What do you need to track?<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Vehicle registration" className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /></label>
            <label className="text-sm text-stone-600">Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white">{categories.map(category => <option key={category}>{category}</option>)}</select></label>
            <label className="text-sm text-stone-600">Due date<input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /></label>
            <label className="text-sm text-stone-600">Repeat<select value={form.repeat} onChange={e => setForm({ ...form, repeat: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white">{repeats.map(repeat => <option key={repeat}>{repeat}</option>)}</select><span className="block text-xs text-stone-400 mt-1">Use repeat for bills, maintenance, renewals, routines, and recurring deadlines.</span></label>
            <label className="text-sm text-stone-600">Time needed<input value={form.timeNeeded} onChange={e => setForm({ ...form, timeNeeded: e.target.value })} placeholder="20 min" className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /><span className="block text-xs text-stone-400 mt-1">This will later help 168 find room in your week.</span></label>
            <label className="text-sm text-stone-600">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'Normal' | 'Important' })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white"><option>Normal</option><option>Important</option></select></label>
            <label className="text-sm text-stone-600 flex items-center gap-2 mt-7"><input type="checkbox" checked={form.autoPay} onChange={e => setForm({ ...form, autoPay: e.target.checked })} className="h-4 w-4" /> Auto-pay</label>
            <label className="text-sm text-stone-600 lg:col-span-3">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 resize-none" placeholder="Anything useful to remember" /></label>
          </div>
          <div className="mt-5 flex justify-end"><button onClick={addItem} className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium">Save Item</button></div>
        </section>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Overdue', counts.overdue, 'bg-rose-50'], ['This Week', counts.week, 'bg-blue-50'], ['This Month', counts.month, 'bg-violet-50'], ['Later', counts.later, 'bg-emerald-50']].map(([label, value, tone]) => <div key={String(label)} className={`border border-stone-200 rounded-xl p-5 ${tone}`}><p className="text-xs uppercase tracking-[0.14em] text-stone-500">{label}</p><p className="text-2xl font-semibold text-stone-900 mt-2">{value}</p></div>)}
      </section>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-stone-200">
          <div className="flex gap-2 text-sm">{(['All', 'Upcoming', 'Overdue', 'Completed'] as const).map(option => <button key={option} onClick={() => setFilter(option)} className={`px-3 py-1.5 rounded-md ${filter === option ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>{option}</button>)}</div>
          <div className="flex rounded-lg border border-stone-200 p-1 text-sm"><button onClick={() => setView('List')} className={`px-3 py-1.5 rounded-md ${view === 'List' ? 'bg-stone-100 font-medium text-stone-900' : 'text-stone-500'}`}>List</button><button onClick={() => setView('Board')} className={`px-3 py-1.5 rounded-md ${view === 'Board' ? 'bg-stone-100 font-medium text-stone-900' : 'text-stone-500'}`}>Board</button></div>
        </div>

        {view === 'List' ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50 border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-6 py-3 font-medium">Item</th><th className="px-6 py-3 font-medium">Category</th><th className="px-6 py-3 font-medium">Due</th><th className="px-6 py-3 font-medium">Repeat</th><th className="px-6 py-3 font-medium">Time</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3 font-medium"></th></tr></thead><tbody className="divide-y divide-stone-100">{visibleItems.map(item => <tr key={item.id} className={item.status === 'Completed' ? 'bg-stone-50/70' : ''}><td className="px-6 py-4"><div className="font-medium text-stone-900">{item.title}</div><div className="text-xs text-stone-400 mt-1">{item.priority}{item.autoPay ? ' - Auto-pay' : ''}</div></td><td className="px-6 py-4 text-stone-500">{item.category}</td><td className="px-6 py-4 text-stone-500">{new Date(`${item.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td className="px-6 py-4 text-stone-500">{item.repeat}</td><td className="px-6 py-4 text-stone-500">{item.timeNeeded || '-'}</td><td className="px-6 py-4"><span className={`text-xs font-medium ${item.status === 'Overdue' ? 'text-red-700' : item.status === 'Completed' ? 'text-stone-400' : 'text-stone-600'}`}>{item.status}</span></td><td className="px-6 py-4 text-right">{item.status !== 'Completed' ? <button onClick={() => markComplete(item.id)} className="text-xs font-medium text-stone-700">Mark Complete</button> : <span className="text-xs text-stone-400">{item.lastCompleted}</span>}</td></tr>)}{visibleItems.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">No items in this view.</td></tr>}</tbody></table></div>
        ) : (
          <div className="p-5">
            <div className="mb-4"><h2 className="font-semibold text-stone-900">Responsibility Board</h2><p className="text-sm text-stone-500 mt-1">Drag cards as they move forward, or use the Move menu on each card. Moving a card to Done marks it complete.</p></div>
            <div className="grid gap-4 lg:grid-cols-4">
              {stages.map(stage => {
                const stageItems = visibleItems.filter(item => item.stage === stage)
                const tone = stage === 'Inbox' ? 'bg-stone-50' : stage === 'This Week' ? 'bg-blue-50/60' : stage === 'In Progress' ? 'bg-violet-50/60' : 'bg-emerald-50/60'
                return <div key={stage} onDragOver={e => e.preventDefault()} onDrop={() => { if (draggedId !== null) moveItem(draggedId, stage); setDraggedId(null) }} className={`rounded-xl border border-stone-200 p-3 min-h-[300px] ${tone}`}>
                  <div className="flex items-center justify-between px-1 pb-3"><h3 className="text-sm font-semibold text-stone-800">{stage}</h3><span className="text-xs text-stone-400">{stageItems.length}</span></div>
                  <div className="space-y-3">{stageItems.map(item => <article key={item.id} draggable onDragStart={() => setDraggedId(item.id)} onDragEnd={() => setDraggedId(null)} className="rounded-xl border border-stone-200 bg-white p-4 cursor-grab active:cursor-grabbing"><div className="flex items-start justify-between gap-2"><div><p className="font-medium text-sm text-stone-900">{item.title}</p><p className="text-xs text-stone-400 mt-1">{item.category}</p></div>{item.priority === 'Important' && <span className="text-[10px] uppercase tracking-wide rounded-full bg-rose-50 text-rose-700 px-2 py-1">Important</span>}</div><div className="mt-4 flex items-center justify-between gap-2 text-xs text-stone-500"><span>Due {new Date(`${item.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span>{item.timeNeeded || 'No time set'}</span></div><label className="block mt-3 text-[11px] uppercase tracking-wide text-stone-400">Move<select value={item.stage} onChange={e => moveItem(item.id, e.target.value as Stage)} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs normal-case tracking-normal text-stone-600">{stages.map(option => <option key={option}>{option}</option>)}</select></label></article>)}{stageItems.length === 0 && <div className="rounded-lg border border-dashed border-stone-300 p-4 text-center text-xs text-stone-400">Drop cards here</div>}</div>
                </div>
              })}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded-xl p-6"><h2 className="text-base font-semibold text-stone-900">How Track works</h2><p className="text-sm text-stone-500 mt-2 max-w-3xl leading-6">The List view helps you scan dates and details. The Board view helps you move responsibilities through your week. Later, items with time needed will connect directly to My 168 so you can schedule them without re-entering anything.</p></section>
    </div>
  )
}
