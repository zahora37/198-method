'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type TrackRow = { id:string; title:string; due_date:string|null; workflow_status:string|null; status:string|null; completed_at:string|null; last_completed_at:string|null }
type TimeRow = { title:string; category:string|null; start_at:string; end_at:string }
type Completion = { track_item_id:string; completed_at:string }
type DoneItem = { id:string; title:string; date:string }
const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const GUEST_ITEMS_KEY='168-method-track-guest-items'

function dateKey(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function weekStart(date:Date){const start=new Date(date);start.setDate(start.getDate()-(start.getDay()+6)%7);start.setHours(0,0,0,0);return start}
function isDone(item:TrackRow){return Boolean(item.completed_at)||item.workflow_status==='completed'||(item.status||'').toLowerCase()==='completed'}
function formatTime(date:string){return new Date(date).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function formatHours(hours:number){return Number.isInteger(hours)?String(hours):hours.toFixed(1)}

export default function DashboardPage(){
  const supabase=useMemo(()=>createClient(),[])
  const [today]=useState(()=>new Date())
  const [month,setMonth]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1))
  const [selected,setSelected]=useState(()=>dateKey(today))
  const [items,setItems]=useState<TrackRow[]>([])
  const [blocks,setBlocks]=useState<TimeRow[]>([])
  const [completed,setCompleted]=useState<DoneItem[]>([])
  const [categoryColors,setCategoryColors]=useState<Record<string,string>>({})
  const [loading,setLoading]=useState(true)
  const [guest,setGuest]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{try{setCategoryColors(JSON.parse(localStorage.getItem('168-category-colors')||'{}'))}catch{}},[])

  useEffect(()=>{
    let active=true
    async function load(){
      setLoading(true);setError('')
      const {data:{user}}=await supabase.auth.getUser()
      if(!active)return
      if(!user){
        setGuest(true);setBlocks([])
        try{
          const saved=JSON.parse(localStorage.getItem(GUEST_ITEMS_KEY)||'[]') as Array<{id:string;title:string;due:string;stage:string;lastCompletedAt:string|null}>
          const guestRows=saved.map(item=>({id:item.id,title:item.title,due_date:item.due,workflow_status:item.stage==='Done'?'completed':'inbox',status:null,completed_at:item.stage==='Done'?item.lastCompletedAt:null,last_completed_at:item.lastCompletedAt}))
          setItems(guestRows)
          setCompleted(guestRows.filter(row=>row.completed_at).map(row=>({id:row.id,title:row.title,date:dateKey(new Date(row.completed_at as string))})))
        }catch{setItems([]);setCompleted([])}
        setLoading(false);return
      }
      setGuest(false)
      const start=new Date(month.getFullYear(),month.getMonth(),1)
      const end=new Date(month.getFullYear(),month.getMonth()+1,1)
      const week=weekStart(today)
      const nextWeek=new Date(week);nextWeek.setDate(week.getDate()+7)
      const [trackResult,blockResult,historyResult]=await Promise.all([
        supabase.from('track_items').select('id,title,due_date,workflow_status,status,completed_at,last_completed_at'),
        supabase.from('time_blocks').select('title,category,start_at,end_at').gte('start_at',week.toISOString()).lt('start_at',nextWeek.toISOString()).order('start_at'),
        supabase.from('track_item_completions').select('track_item_id,completed_at').gte('completed_at',start.toISOString()).lt('completed_at',end.toISOString())
      ])
      if(!active)return
      if(trackResult.error||blockResult.error){setError('Your dashboard could not load. Please refresh the page.');setLoading(false);return}
      const track=(trackResult.data||[]) as TrackRow[]
      const history=(historyResult.data||[]) as Completion[]
      const names=new Map(track.map(item=>[item.id,item.title]))
      const done=history.map(entry=>({id:entry.track_item_id,title:names.get(entry.track_item_id)||'Completed item',date:dateKey(new Date(entry.completed_at))}))
      for(const item of track){
        const timestamp=item.completed_at||item.last_completed_at
        if(timestamp&&new Date(timestamp)>=start&&new Date(timestamp)<end&&!done.some(entry=>entry.id===item.id&&entry.date===dateKey(new Date(timestamp)))){
          done.push({id:item.id,title:item.title,date:dateKey(new Date(timestamp))})
        }
      }
      setItems(track);setBlocks((blockResult.data||[]) as TimeRow[]);setCompleted(done);setLoading(false)
    }
    void load()
    return()=>{active=false}
  },[supabase,month,today])

  function changeMonth(offset:number){
    const next=new Date(month.getFullYear(),month.getMonth()+offset,1)
    setMonth(next)
    setSelected(dateKey(next.getFullYear()===today.getFullYear()&&next.getMonth()===today.getMonth()?today:next))
  }
  const monthDays=new Date(month.getFullYear(),month.getMonth()+1,0).getDate()
  const leading=new Date(month.getFullYear(),month.getMonth(),1).getDay()
  const counts=useMemo(()=>completed.reduce((result,item)=>{result[item.date]=(result[item.date]||0)+1;return result},{} as Record<string,number>),[completed])
  const selectedDone=completed.filter(item=>item.date===selected)
  const daysActive=Object.keys(counts).filter(day=>day.startsWith(dateKey(month).slice(0,7))).length
  const todayKey=dateKey(today)
  const todayBlocks=blocks.filter(block=>dateKey(new Date(block.start_at))===todayKey)
  const planned=blocks.reduce((sum,block)=>sum+(new Date(block.end_at).getTime()-new Date(block.start_at).getTime())/3600000,0)
  const upcoming=items.filter(item=>!isDone(item)&&item.due_date).sort((a,b)=>(a.due_date||'').localeCompare(b.due_date||''))
  const monthTitle=month.toLocaleDateString('en-US',{month:'long',year:'numeric'})
  const selectedTitle=new Date(`${selected}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-5">
      <div><p className="text-sm text-stone-500">{today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">Dashboard</h1></div>
      <p className="text-sm text-stone-500">Plan your time. Track what is due. Know what to focus on.</p>
    </header>
    {error&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    <section className="progress-panel overflow-hidden rounded-2xl border border-stone-200 p-5 shadow-sm sm:p-7" aria-label="Daily Progress">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.17em] progress-accent">Track your days</p><h2 className="mt-2 text-2xl font-semibold">Daily Progress</h2><p className="mt-1 text-sm progress-muted">Completed responsibilities from Track.</p></div>
        <Link href="/dashboard/track" className="rounded-lg border border-stone-200 px-3 py-2 text-sm progress-accent hover:opacity-70">Open Track</Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(230px,0.6fr)]">
        <div className="progress-card rounded-xl p-3 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold sm:text-base">{monthTitle}</h3>
            <div className="flex items-center gap-1"><button type="button" onClick={()=>changeMonth(-1)} aria-label="Previous month" className="rounded-lg p-2 progress-muted hover:opacity-70"><ChevronLeft size={18}/></button><button type="button" onClick={()=>changeMonth(1)} aria-label="Next month" className="rounded-lg p-2 progress-muted hover:opacity-70"><ChevronRight size={18}/></button></div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">{WEEKDAYS.map(day=><span key={day} className="pb-2 text-[10px] font-medium uppercase progress-muted sm:text-xs">{day}</span>)}
            {Array.from({length:leading},(_,index)=><span key={`empty-${index}`} aria-hidden="true"/>)}
            {Array.from({length:monthDays},(_,index)=>{
              const date=dateKey(new Date(month.getFullYear(),month.getMonth(),index+1))
              const done=counts[date]||0
              return <button type="button" key={date} onClick={()=>setSelected(date)} aria-label={`${date}, ${done} completed`} aria-pressed={selected===date} className={`flex aspect-square min-h-9 flex-col items-center justify-center rounded-lg text-sm transition-colors sm:min-h-11 ${selected===date?'progress-selected':''} ${done?'progress-filled':'progress-cell'} ${date===todayKey&&!done?'progress-today':''}`}><span className="font-medium">{index+1}</span>{done>0&&<span className="text-[9px] leading-none">{done} done</span>}</button>
            })}
          </div>
          <div className="progress-divider progress-muted mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs"><span><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-accent"/>Day with completed items</span><span>{daysActive} active {daysActive===1?'day':'days'} this month</span></div>
        </div>
        <div className="progress-card flex flex-col rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider progress-muted">{selectedTitle}</p>
          <p className="progress-accent mt-4 text-4xl font-semibold">{loading?'…':selectedDone.length}</p><p className="mt-1 text-sm progress-muted">{selectedDone.length===1?'item completed':'items completed'}</p>
          <div className="progress-divider mt-5 border-t pt-4">{selectedDone.length?<ul className="space-y-3">{selectedDone.map((item,index)=><li key={`${item.id}-${index}`} className="flex items-start gap-3 text-sm"><span className="progress-accent mt-0.5">✓</span><span>{item.title}</span></li>)}</ul>:<p className="text-sm leading-6 progress-muted">No completed items recorded for this day.</p>}</div>
          <Link href="/dashboard/track" className="progress-accent mt-auto pt-6 text-sm font-medium hover:opacity-70">View responsibilities →</Link>
        </div>
      </div>
      {guest&&<p className="mt-4 text-xs progress-muted">Guest progress stays on this device. Sign in to keep your history.</p>}
    </section>
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-semibold">Your 168</h2><p className="mt-1 text-sm text-stone-500">Your time balance this week.</p></div><Link href="/dashboard/my-168" className="text-sm font-medium text-violet-700">View My 168</Link></div><div className="grid grid-cols-3 divide-x rounded-lg border border-stone-200">{[['Total','168'],['Planned',formatHours(planned)],['Available',formatHours(Math.max(0,168-planned))]].map(([label,value])=><div key={label} className="min-w-0 p-3 sm:p-5"><p className="text-[10px] uppercase tracking-wider text-stone-500 sm:text-xs">{label}</p><p className="mt-2 text-2xl font-semibold sm:text-3xl">{loading?'…':value}</p><p className="text-xs text-stone-500">hours</p></div>)}</div></section>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Today</h2><Link href="/dashboard/my-168" className="text-sm text-violet-700">Open schedule</Link></div><div className="mt-4 divide-y border-y">{todayBlocks.length?todayBlocks.map((block,index)=><div key={`${block.start_at}-${index}`} className="flex flex-wrap justify-between gap-2 border-l-4 py-3 pl-3 text-sm" style={{borderColor:categoryColors[block.category||'']||'#ddd6fe'}}><span className="font-medium">{block.title}</span><span className="text-stone-500">{formatTime(block.start_at)} - {formatTime(block.end_at)}</span></div>):<p className="py-5 text-sm text-stone-500">No time blocks in My 168 today.</p>}</div></section>
      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Focus</h2><Link href="/dashboard/focus" className="text-sm text-violet-700">Find Time</Link></div><div className="mt-4 divide-y border-y">{upcoming.length?upcoming.slice(0,3).map(item=><div key={item.id} className="py-3"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-stone-500">{item.due_date&&item.due_date<todayKey?'Overdue':'Due'} {item.due_date&&new Date(`${item.due_date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p></div>):<p className="py-5 text-sm text-stone-500">No open responsibilities with due dates.</p>}</div></section></div>
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Upcoming</h2><Link href="/dashboard/track" className="text-sm text-violet-700">View Track</Link></div><div className="mt-4 divide-y border-y">{upcoming.length?upcoming.slice(0,5).map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-1 py-3 text-sm"><span className="font-medium">{item.title}</span><span className="text-stone-500">{item.due_date&&new Date(`${item.due_date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div>):<p className="py-5 text-sm text-stone-500">Add a responsibility in Track to see it here.</p>}</div></section>
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="font-semibold">Ask 168</h2><p className="mt-1 text-sm text-stone-500">Get help arranging your schedule and finding time.</p><Link href="/dashboard/ask-168" className="mt-4 inline-block rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">Ask about your week</Link></section>
  </div>
}
