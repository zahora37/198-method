'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Stage = 'Inbox' | 'This Week' | 'In Progress' | 'Done'
type Priority = 'Normal' | 'Important'
type Filter = 'All' | 'Upcoming' | 'Overdue' | 'Completed'

type TrackItem = {
  id: string
  title: string
  category: string
  due: string
  repeat: string
  timeNeededMinutes: number | null
  priority: Priority
  stage: Stage
  autoPay: boolean
  notes: string
  lastCompletedAt: string | null
}

type TrackRow = {
  id: string
  title: string
  category: string | null
  due_date: string | null
  repeat_rule: string | null
  time_needed_minutes: number | null
  priority: string | null
  auto_pay: boolean | null
  notes: string | null
  workflow_status: string | null
  status: string | null
  last_completed_at: string | null
  completed_at: string | null
}

type FormState = {
  title: string
  category: string
  due: string
  repeat: string
  timeNeeded: string
  priority: Priority
  autoPay: boolean
  notes: string
}

const categories = ['Finance', 'Subscription', 'Home', 'Vehicle', 'Family', 'Health', 'Work', 'Education', 'School', 'Personal', 'Social', 'Other']
const repeats = ['Does not repeat', 'Weekly', 'Monthly', 'Every 3 months', 'Every 6 months', 'Yearly', 'Custom']
const stages: Stage[] = ['Inbox', 'This Week', 'In Progress', 'Done']
const emptyForm: FormState = { title: '', category: 'Personal', due: '', repeat: 'Does not repeat', timeNeeded: '', priority: 'Normal', autoPay: false, notes: '' }

const guestItems: TrackItem[] = [
  { id: 'guest-1', title: 'Vehicle registration', category: 'Vehicle', due: '2026-09-18', repeat: 'Yearly', timeNeededMinutes: 20, priority: 'Important', stage: 'This Week', autoPay: false, notes: '', lastCompletedAt: null },
  { id: 'guest-2', title: 'Review monthly subscriptions', category: 'Subscription', due: '2026-09-24', repeat: 'Monthly', timeNeededMinutes: 15, priority: 'Normal', stage: 'Inbox', autoPay: true, notes: '', lastCompletedAt: null },
]

function stageFromRow(row: TrackRow): Stage {
  if ((row.status || '').toLowerCase() === 'completed' || row.completed_at) return 'Done'
  if (row.workflow_status === 'planned') return 'This Week'
  if (row.workflow_status === 'in_progress') return 'In Progress'
  if (row.workflow_status === 'completed') return 'Done'
  return 'Inbox'
}

function workflowFromStage(stage: Stage) {
  if (stage === 'This Week') return 'planned'
  if (stage === 'In Progress') return 'in_progress'
  if (stage === 'Done') return 'completed'
  return 'inbox'
}

function rowToItem(row: TrackRow): TrackItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category || 'Personal',
    due: row.due_date || '',
    repeat: row.repeat_rule || 'Does not repeat',
    timeNeededMinutes: row.time_needed_minutes,
    priority: (row.priority || '').toLowerCase() === 'important' ? 'Important' : 'Normal',
    stage: stageFromRow(row),
    autoPay: Boolean(row.auto_pay),
    notes: row.notes || '',
    lastCompletedAt: row.last_completed_at || row.completed_at,
  }
}

function todayStart() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function itemStatus(item: TrackItem): Exclude<Filter, 'All'> {
  if (item.stage === 'Done') return 'Completed'
  if (item.due && new Date(`${item.due}T12:00:00`) < todayStart()) return 'Overdue'
  return 'Upcoming'
}

function formatMinutes(minutes: number | null) {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function TrackPage() {
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState<TrackItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [view, setView] = useState<'List' | 'Board'>('List')
  const [showForm, setShowForm] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    void loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    setMessage('')
    const { data: authData } = await supabase.auth.getUser()
    const user = authData.user
    if (!user) {
      setUserId(null)
      setItems(guestItems)
      setLoading(false)
      return
    }

    setUserId(user.id)
    const { data, error } = await supabase
      .from('track_items')
      .select('id,title,category,due_date,repeat_rule,time_needed_minutes,priority,auto_pay,notes,workflow_status,status,last_completed_at,completed_at')
      .order('due_date', { ascending: true })

    if (error) {
      setMessage(`Could not load Track items: ${error.message}`)
      setItems([])
    } else {
      setItems((data as TrackRow[]).map(rowToItem))
    }
    setLoading(false)
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setMessage('')
  }

  function beginEdit(item: TrackItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      category: item.category,
      due: item.due,
      repeat: item.repeat,
      timeNeeded: item.timeNeededMinutes ? String(item.timeNeededMinutes) : '',
      priority: item.priority,
      autoPay: item.autoPay,
      notes: item.notes,
    })
    setShowForm(true)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveItem() {
    if (!form.title.trim() || !form.due) {
      setMessage('Add a title and due date before saving.')
      return
    }

    const minutes = form.timeNeeded.trim() ? Number(form.timeNeeded) : null
    if (minutes !== null && (!Number.isFinite(minutes) || minutes < 0)) {
      setMessage('Time needed must be a valid number of minutes.')
      return
    }

    setSaving(true)
    setMessage('')
    const payload = {
      title: form.title.trim(),
      category: form.category,
      due_date: form.due,
      repeat_rule: form.repeat,
      time_needed_minutes: minutes === null ? null : Math.round(minutes),
      priority: form.priority,
      auto_pay: form.autoPay,
      notes: form.notes.trim(),
    }

    if (!userId) {
      if (editingId) {
        setItems(current => current.map(item => item.id === editingId ? { ...item, title: payload.title, category: payload.category, due: payload.due_date, repeat: payload.repeat_rule, timeNeededMinutes: payload.time_needed_minutes, priority: payload.priority, autoPay: payload.auto_pay, notes: payload.notes } : item))
      } else {
        setItems(current => [...current, { id: `guest-${Date.now()}`, title: payload.title, category: payload.category, due: payload.due_date, repeat: payload.repeat_rule, timeNeededMinutes: payload.time_needed_minutes, priority: payload.priority, stage: 'Inbox', autoPay: payload.auto_pay, notes: payload.notes, lastCompletedAt: null }])
      }
      resetForm()
      setSaving(false)
      return
    }

    if (editingId) {
      const { error } = await supabase.from('track_items').update(payload).eq('id', editingId)
      if (error) setMessage(`Could not update item: ${error.message}`)
      else {
        await loadItems()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('track_items').insert({ ...payload, user_id: userId, workflow_status: 'inbox' })
      if (error) setMessage(`Could not save item: ${error.message}`)
      else {
        await loadItems()
        resetForm()
      }
    }
    setSaving(false)
  }

  async function moveItem(id: string, stage: Stage) {
    const previous = items.find(item => item.id === id)
    if (!previous || previous.stage === stage) return
    const completedAt = stage === 'Done' ? new Date().toISOString() : null

    if (!userId) {
      setItems(current => current.map(item => item.id === id ? { ...item, stage, lastCompletedAt: completedAt || item.lastCompletedAt } : item))
      return
    }

    const update = stage === 'Done'
      ? { workflow_status: workflowFromStage(stage), completed_at: completedAt, last_completed_at: completedAt }
      : { workflow_status: workflowFromStage(stage), completed_at: null }

    const { error } = await supabase.from('track_items').update(update).eq('id', id)
    if (error) {
      setMessage(`Could not move item: ${error.message}`)
      return
    }

    if (stage === 'Done' && previous.stage !== 'Done' && isUuid(id)) {
      await supabase.from('track_item_completions').insert({ user_id: userId, track_item_id: id, completed_at: completedAt })
    }
    await loadItems()
  }

  async function deleteItem(id: string) {
    if (!window.confirm('Delete this Track item?')) return
    if (!userId) {
      setItems(current => current.filter(item => item.id !== id))
      return
    }
    const { error } = await supabase.from('track_items').delete().eq('id', id)
    if (error) setMessage(`Could not delete item: ${error.message}`)
    else await loadItems()
  }

  const enriched = useMemo(() => items.map(item => ({ ...item, displayStatus: itemStatus(item) })), [items])
  const visibleItems = useMemo(() => enriched.filter(item => filter === 'All' || item.displayStatus === filter).sort((a, b) => a.due.localeCompare(b.due)), [enriched, filter])
  const counts = useMemo(() => {
    const today = todayStart()
    const sevenDays = new Date(today); sevenDays.setDate(today.getDate() + 7)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    return {
      overdue: enriched.filter(item => item.displayStatus === 'Overdue').length,
      week: enriched.filter(item => item.displayStatus !== 'Completed' && item.due && new Date(`${item.due}T12:00:00`) >= today && new Date(`${item.due}T12:00:00`) <= sevenDays).length,
      month: enriched.filter(item => item.displayStatus !== 'Completed' && item.due && new Date(`${item.due}T12:00:00`) >= today && new Date(`${item.due}T12:00:00`) <= monthEnd).length,
      later: enriched.filter(item => item.displayStatus !== 'Completed' && item.due && new Date(`${item.due}T12:00:00`) > monthEnd).length,
    }
  }, [enriched])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-sm text-stone-500">Track what is due.</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Track</h1>
          <p className="text-sm text-stone-500 mt-2 max-w-2xl leading-6">Keep responsibilities, deadlines, renewals, bills, appointments, and reminders in one place so 168 can connect them to your time and priorities.</p>
        </div>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true) }} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">{showForm ? 'Close' : 'Add Item'}</button>
      </header>

      {!userId && !loading && <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">Guest preview. Sign in to save Track items to your account.</div>}
      {message && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      {showForm && (
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-stone-900">{editingId ? 'Edit Track item' : 'Add something you need to remember'}</h2>
            <p className="text-sm text-stone-500 mt-1">Give 168 enough information to understand when it is due and how much time it may need.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-sm text-stone-600 lg:col-span-2">What do you need to track?<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Vehicle registration" className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /></label>
            <label className="text-sm text-stone-600">Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white">{categories.map(category => <option key={category}>{category}</option>)}</select></label>
            <label className="text-sm text-stone-600">Due date<input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /></label>
            <label className="text-sm text-stone-600">Repeat<select value={form.repeat} onChange={e => setForm({ ...form, repeat: e.target.value })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white">{repeats.map(repeat => <option key={repeat}>{repeat}</option>)}</select></label>
            <label className="text-sm text-stone-600">Time needed (minutes)<input type="number" min="0" value={form.timeNeeded} onChange={e => setForm({ ...form, timeNeeded: e.target.value })} placeholder="20" className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5" /></label>
            <label className="text-sm text-stone-600">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 bg-white"><option>Normal</option><option>Important</option></select></label>
            <label className="text-sm text-stone-600 flex items-center gap-2 mt-7"><input type="checkbox" checked={form.autoPay} onChange={e => setForm({ ...form, autoPay: e.target.checked })} className="h-4 w-4" /> Auto-pay</label>
            <label className="text-sm text-stone-600 lg:col-span-3">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1.5 w-full border border-stone-300 rounded-lg px-3 py-2.5 resize-none" placeholder="Anything useful to remember" /></label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {editingId && <button onClick={resetForm} className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-700">Cancel</button>}
            <button disabled={saving} onClick={() => void saveItem()} className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Item'}</button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Overdue', counts.overdue, 'bg-rose-50'], ['This Week', counts.week, 'bg-blue-50'], ['This Month', counts.month, 'bg-violet-50'], ['Later', counts.later, 'bg-emerald-50']].map(([label, value, tone]) => <div key={String(label)} className={`border border-stone-200 rounded-xl p-5 ${tone}`}><p className="text-xs uppercase tracking-[0.14em] text-stone-500">{label}</p><p className="text-2xl font-semibold text-stone-900 mt-2">{value}</p></div>)}
      </section>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-stone-200">
          <div className="flex flex-wrap gap-2 text-sm">{(['All', 'Upcoming', 'Overdue', 'Completed'] as const).map(option => <button key={option} onClick={() => setFilter(option)} className={`px-3 py-1.5 rounded-md ${filter === option ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>{option}</button>)}</div>
          <div className="flex rounded-lg border border-stone-200 p-1 text-sm"><button onClick={() => setView('List')} className={`px-3 py-1.5 rounded-md ${view === 'List' ? 'bg-stone-100 font-medium text-stone-900' : 'text-stone-500'}`}>List</button><button onClick={() => setView('Board')} className={`px-3 py-1.5 rounded-md ${view === 'Board' ? 'bg-stone-100 font-medium text-stone-900' : 'text-stone-500'}`}>Board</button></div>
        </div>

        {loading ? <div className="p-12 text-center text-sm text-stone-500">Loading Track...</div> : view === 'List' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-3 font-medium">Item</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Due</th><th className="px-5 py-3 font-medium">Repeat</th><th className="px-5 py-3 font-medium">Time</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {visibleItems.map(item => <tr key={item.id} className={item.displayStatus === 'Completed' ? 'bg-stone-50/70' : ''}>
                  <td className="px-5 py-4"><div className="font-medium text-stone-900">{item.title}</div><div className="text-xs text-stone-400 mt-1">{item.priority}{item.autoPay ? ' - Auto-pay' : ''}</div></td>
                  <td className="px-5 py-4 text-stone-500">{item.category}</td><td className="px-5 py-4 text-stone-500">{formatDate(item.due)}</td><td className="px-5 py-4 text-stone-500">{item.repeat}</td><td className="px-5 py-4 text-stone-500">{formatMinutes(item.timeNeededMinutes)}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-medium ${item.displayStatus === 'Overdue' ? 'text-red-700' : item.displayStatus === 'Completed' ? 'text-stone-400' : 'text-stone-600'}`}>{item.displayStatus}</span></td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-3 text-xs font-medium">{item.stage !== 'Done' && <button onClick={() => void moveItem(item.id, 'Done')} className="text-stone-800">Complete</button>}<button onClick={() => beginEdit(item)} className="text-stone-600">Edit</button><button onClick={() => void deleteItem(item.id)} className="text-red-700">Delete</button></div>{item.stage === 'Done' && item.lastCompletedAt && <div className="text-[11px] text-stone-400 mt-1">Completed {new Date(item.lastCompletedAt).toLocaleDateString()}</div>}</td>
                </tr>)}
                {visibleItems.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">No items in this view.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <div className="mb-4"><h2 className="font-semibold text-stone-900">Responsibility Board</h2><p className="text-sm text-stone-500 mt-1">Move responsibilities as they progress. Done records completion.</p></div>
            <div className="grid gap-4 lg:grid-cols-4">
              {stages.map(stage => {
                const stageItems = visibleItems.filter(item => item.stage === stage)
                const tone = stage === 'Inbox' ? 'bg-stone-50' : stage === 'This Week' ? 'bg-blue-50/60' : stage === 'In Progress' ? 'bg-violet-50/60' : 'bg-emerald-50/60'
                return <div key={stage} onDragOver={event => event.preventDefault()} onDrop={() => { if (draggedId) void moveItem(draggedId, stage); setDraggedId(null) }} className={`rounded-xl border border-stone-200 p-3 min-h-[300px] ${tone}`}>
                  <div className="flex items-center justify-between px-1 pb-3"><h3 className="text-sm font-semibold text-stone-800">{stage}</h3><span className="text-xs text-stone-400">{stageItems.length}</span></div>
                  <div className="space-y-3">{stageItems.map(item => <article key={item.id} draggable onDragStart={() => setDraggedId(item.id)} onDragEnd={() => setDraggedId(null)} className="rounded-xl border border-stone-200 bg-white p-4 cursor-grab active:cursor-grabbing">
                    <div className="flex items-start justify-between gap-2"><div><p className="font-medium text-sm text-stone-900">{item.title}</p><p className="text-xs text-stone-400 mt-1">{item.category}</p></div>{item.priority === 'Important' && <span className="text-[10px] uppercase tracking-wide rounded-full bg-rose-50 text-rose-700 px-2 py-1">Important</span>}</div>
                    <div className="mt-3 text-xs text-stone-500 space-y-1"><p>Due {formatDate(item.due)}</p><p>{formatMinutes(item.timeNeededMinutes)}</p></div>
                    <select value={item.stage} onChange={e => void moveItem(item.id, e.target.value as Stage)} className="mt-3 w-full border border-stone-200 rounded-md px-2 py-1.5 text-xs bg-white">{stages.map(option => <option key={option}>{option}</option>)}</select>
                    <div className="mt-3 flex gap-3 text-xs"><button onClick={() => beginEdit(item)} className="text-stone-600">Edit</button><button onClick={() => void deleteItem(item.id)} className="text-red-700">Delete</button></div>
                  </article>)}</div>
                </div>
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
