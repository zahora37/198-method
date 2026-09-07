'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type BlockType = 'Fixed' | 'Fluid'
type DayChoice = 'All Week' | 'Work Days' | 'Weekend' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type TimeBlock = { id: string; title: string; day: string; start: string; end: string; category: string; type: BlockType }
type Palette = Record<string, string>
type InsertRow = { user_id: string; title: string; category: string; start_at: string; end_at: string; repeat_rule: string; notes: string }
type SavedRow = { id: string; title: string; category: string | null; start_at: string; end_at: string; block_type: string }
type SaveError = { message: string }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_CHOICES: DayChoice[] = ['All Week', 'Work Days', 'Weekend', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM']
const CATEGORIES = ['Sleep', 'Work', 'Family', 'Health', 'Home', 'Personal', 'Education', 'Social', 'Other']
const COLORS = [['Lavender','#ddd6fe'],['Sage','#d1fae5'],['Powder Blue','#dbeafe'],['Soft Rose','#fce7f3'],['Peach','#ffedd5'],['Sand','#f5f0e6'],['Mint','#ccfbf1'],['Butter','#fef3c7'],['Lilac','#f3e8ff']]
const DEFAULT_COLORS: Palette = { Sleep:'#ddd6fe', Work:'#dbeafe', Family:'#fce7f3', Health:'#d1fae5', Home:'#fef3c7', Personal:'#f3e8ff', Education:'#ccfbf1', Social:'#ffedd5', Other:'#f5f0e6' }
const guestBlocks: TimeBlock[] = [
  { id:'g1', title:'Work', day:'Mon', start:'8 AM', end:'5 PM', category:'Work', type:'Fixed' },
  { id:'g2', title:'Work', day:'Tue', start:'8 AM', end:'5 PM', category:'Work', type:'Fixed' },
  { id:'g3', title:'Workout', day:'Wed', start:'6 PM', end:'7 PM', category:'Health', type:'Fluid' },
  { id:'g4', title:'Family Time', day:'Sun', start:'1 PM', end:'4 PM', category:'Family', type:'Fixed' },
]

function hour24(value:string){ const [raw,period]=value.split(' '); let h=Number(raw); if(period==='PM'&&h!==12)h+=12; if(period==='AM'&&h===12)h=0; return h }
function duration(start:string,end:string){ const s=hour24(start), e=hour24(end); if(e===s)return 0; return e>s?e-s:24-s+e }
function startOfWeek(date=new Date()){ const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()+(day===0?-6:1-day)); d.setHours(0,0,0,0); return d }
function dateForDay(day:string){ const d=startOfWeek(); d.setDate(d.getDate()+DAYS.indexOf(day)); return d }
function isoRange(day:string,start:string,end:string){ const startDate=dateForDay(day); startDate.setHours(hour24(start),0,0,0); const endDate=new Date(startDate); endDate.setHours(hour24(end),0,0,0); if(hour24(end)<hour24(start))endDate.setDate(endDate.getDate()+1); return {startAt:startDate.toISOString(),endAt:endDate.toISOString()} }
function displayTime(date:string){ return new Date(date).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}).replace(':00','') }
function dayName(date:string){ return DAYS[(new Date(date).getDay()+6)%7] }
function daysForChoice(choice:DayChoice){ if(choice==='All Week')return DAYS; if(choice==='Work Days')return DAYS.slice(0,5); if(choice==='Weekend')return DAYS.slice(5); return [choice] }
function uiTypeFromDb(value:string):BlockType{ return value.toLowerCase()==='fixed'?'Fixed':'Fluid' }

export default function My168Page(){
  const supabase=useMemo(()=>createClient(),[])
  const [blocks,setBlocks]=useState<TimeBlock[]>([])
  const [userId,setUserId]=useState<string|null>(null)
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')
  const [showForm,setShowForm]=useState(false)
  const [showColors,setShowColors]=useState(false)
  const [categoryColors,setCategoryColors]=useState<Palette>(DEFAULT_COLORS)
  const [form,setForm]=useState({title:'',day:'Mon' as DayChoice,start:'8 AM',end:'9 AM',category:'Personal',type:'Fluid' as BlockType})

  useEffect(()=>{ const saved=localStorage.getItem('168-category-colors'); if(saved){try{setCategoryColors({...DEFAULT_COLORS,...JSON.parse(saved)})}catch{}} },[])
  useEffect(()=>{ void loadBlocks() },[])

  async function loadBlocks(){
    setLoading(true); setMessage('')
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){ setUserId(null); setBlocks(guestBlocks); setLoading(false); return }
    setUserId(user.id)
    const monday=startOfWeek(); const next=new Date(monday); next.setDate(next.getDate()+7)
    const {data,error}=await supabase.from('time_blocks').select('id,title,category,start_at,end_at,block_type').gte('start_at',monday.toISOString()).lt('start_at',next.toISOString()).order('start_at')
    if(error){ setMessage(`Could not load your schedule: ${error.message}`); setBlocks([]) }
    else setBlocks((data||[]).map(row=>({id:row.id,title:row.title,category:row.category||'Other',day:dayName(row.start_at),start:displayTime(row.start_at),end:displayTime(row.end_at),type:uiTypeFromDb(row.block_type)})))
    setLoading(false)
  }

  async function insertRows(rows:InsertRow[]):Promise<{data:SavedRow[]|null;error:SaveError|null}>{
    const candidates = form.type==='Fluid' ? ['Flexible','flexible','Fluid','fluid'] : ['Fixed','fixed']
    let lastError: SaveError | null = null
    for(const dbType of candidates){
      const result=await supabase.from('time_blocks').insert(rows.map(row=>({...row,block_type:dbType}))).select('id,title,category,start_at,end_at,block_type')
      if(!result.error)return {data:(result.data||[]) as SavedRow[],error:null}
      lastError={message:result.error.message}
      if(!result.error.message.includes('time_blocks_block_type_check'))break
    }
    return {data:null,error:lastError}
  }

  async function addBlock(){
    if(!form.title.trim()){ setMessage('Add an activity name before saving.'); return }
    if(duration(form.start,form.end)<=0){ setMessage('Start and end time cannot be the same.'); return }
    const selectedDays=daysForChoice(form.day)
    if(!userId){
      setBlocks(current=>[...current,...selectedDays.map((day,index)=>({id:`guest-${Date.now()}-${index}`,title:form.title.trim(),day,start:form.start,end:form.end,category:form.category,type:form.type}))])
      setShowForm(false); setMessage('Added to preview. Sign in to save it to your account.'); return
    }

    setMessage('Saving...')
    const rows:InsertRow[]=selectedDays.map(day=>{ const {startAt,endAt}=isoRange(day,form.start,form.end); return {user_id:userId,title:form.title.trim(),category:form.category,start_at:startAt,end_at:endAt,repeat_rule:'none',notes:''} })
    const {data,error}=await insertRows(rows)
    if(error){ setMessage(`Could not save: ${error.message}`); return }

    const saved=(data||[]).map(row=>({id:row.id,title:row.title,category:row.category||'Other',day:dayName(row.start_at),start:displayTime(row.start_at),end:displayTime(row.end_at),type:uiTypeFromDb(row.block_type)}))
    setBlocks(current=>[...current,...saved])
    setForm({title:'',day:'Mon',start:'8 AM',end:'9 AM',category:'Personal',type:'Fluid'})
    setShowForm(false)
    setMessage(selectedDays.length>1?`Saved ${selectedDays.length} blocks to your 168.`:'Saved to your 168.')
  }

  function setColor(category:string,color:string){ const next={...categoryColors,[category]:color}; setCategoryColors(next); localStorage.setItem('168-category-colors',JSON.stringify(next)) }
  const planned=useMemo(()=>blocks.reduce((sum,b)=>sum+duration(b.start,b.end),0),[blocks])
  const available=Math.max(168-planned,0)
  const totals=useMemo(()=>{const t:Record<string,number>={}; blocks.forEach(b=>t[b.category]=(t[b.category]||0)+duration(b.start,b.end)); return Object.entries(t).sort((a,b)=>b[1]-a[1])},[blocks])

  return <div className="max-w-7xl mx-auto space-y-6">
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-stone-500">Plan your time with intention.</p><h1 className="mt-1 text-3xl font-semibold text-stone-900">My 168</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Start with commitments that already own part of your week. Fixed blocks stay in place. Fluid blocks matter, but can move when life changes.</p><p className="mt-2 text-xs font-medium text-stone-400">{loading?'Loading your week...':userId?'Signed in - changes are saved to your account':'Preview mode - sign in to save your schedule'}</p></div><div className="flex flex-wrap gap-2 text-sm"><button onClick={()=>setShowColors(v=>!v)} className="rounded-lg border border-stone-200 bg-white px-3 py-2">Customize Colors</button><button className="rounded-lg border border-stone-200 bg-white px-3 py-2">Previous</button><button className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-medium">This Week</button><button className="rounded-lg border border-stone-200 bg-white px-3 py-2">Next</button></div></header>

    {message&&<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">{message}</div>}

    {showColors&&<section className="bg-white border border-stone-200 rounded-2xl p-6"><h2 className="text-lg font-semibold">Choose what each color means</h2><p className="text-sm text-stone-500 mt-2">Category color and Fixed or Fluid are separate so your week stays easy to read.</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{CATEGORIES.map(c=><label key={c} className="flex items-center justify-between rounded-xl border border-stone-200 p-3 text-sm"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor:categoryColors[c]}}/>{c}</span><select value={categoryColors[c]} onChange={e=>setColor(c,e.target.value)} className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs">{COLORS.map(([n,v])=><option key={n} value={v}>{n}</option>)}</select></label>)}</div></section>}

    <section className="grid gap-4 md:grid-cols-[1fr_320px]"><div className="bg-white border border-stone-200 rounded-xl p-6"><div className="grid sm:grid-cols-3 border border-stone-200 rounded-lg overflow-hidden">{[['Total',168],['Planned',planned],['Available',available]].map(([l,v],i)=><div key={String(l)} className={`p-5 ${i?'sm:border-l border-stone-200':''}`}><p className="text-xs uppercase tracking-wider text-stone-400">{l}</p><p className="text-3xl font-semibold mt-2">{v}</p><p className="text-xs text-stone-500">hours</p></div>)}</div></div><aside className="bg-white border border-stone-200 rounded-xl p-5"><h2 className="text-sm font-semibold">Time Breakdown</h2><div className="mt-4 divide-y divide-stone-100">{totals.length?totals.map(([c,h])=><div key={c} className="flex justify-between py-3 text-sm"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor:categoryColors[c]}}/>{c}</span><b>{h}h</b></div>):<p className="py-4 text-sm text-stone-400">Your saved week is empty. Add your first commitment below.</p>}</div></aside></section>

    <section className="bg-white border border-stone-200 rounded-xl overflow-hidden"><div className="flex items-center justify-between border-b border-stone-200 p-5"><div><h2 className="font-semibold">Weekly Schedule</h2><p className="text-xs text-stone-500 mt-2">Solid border = Fixed. Dashed border = Fluid. Choose a single day, Work Days, Weekend, or All Week.</p></div><button onClick={()=>setShowForm(v=>!v)} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm">{showForm?'Close':'Add Time'}</button></div>

    {showForm&&<div className="border-b border-stone-200 bg-stone-50 p-5"><p className="text-sm text-stone-600 mb-4">Add one commitment or apply the same time to a group of days. Overnight blocks are supported through 12 AM.</p><div className="grid gap-4 md:grid-cols-6"><label className="md:col-span-2 text-xs">Activity<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-lg border p-2" placeholder="Work, school, workout..."/></label><label className="text-xs">Days<select value={form.day} onChange={e=>setForm({...form,day:e.target.value as DayChoice})} className="mt-1 w-full rounded-lg border p-2">{DAY_CHOICES.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">Start<select value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="mt-1 w-full rounded-lg border p-2">{HOURS.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">End<select value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="mt-1 w-full rounded-lg border p-2">{HOURS.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs">Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as BlockType})} className="mt-1 w-full rounded-lg border p-2"><option>Fixed</option><option>Fluid</option></select></label><label className="md:col-span-2 text-xs">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1 w-full rounded-lg border p-2">{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label><div className="md:col-span-4 flex flex-col items-end justify-end gap-2">{message&&<p className={`w-full text-right text-sm ${message.startsWith('Could not')?'text-red-600':'text-stone-600'}`}>{message}</p>}<button onClick={addBlock} className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white">Save Time</button></div></div></div>}

    <div className="overflow-x-auto"><div className="min-w-[980px]"><div className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] bg-stone-50 border-b"><div className="p-3 text-xs text-stone-400">TIME</div>{DAYS.map(d=><div key={d} className="border-l p-3 text-center text-sm font-medium">{d}</div>)}</div>{HOURS.map(h=><div key={h} className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] border-b border-stone-100"><div className="p-3 text-xs text-stone-400">{h}</div>{DAYS.map(d=><div key={`${d}-${h}`} className="min-h-16 border-l border-stone-100 p-1.5">{blocks.filter(b=>b.day===d&&b.start===h).map(b=><div key={b.id} style={{backgroundColor:categoryColors[b.category]||DEFAULT_COLORS.Other}} className={`rounded-md border-2 px-2.5 py-2 text-xs text-stone-800 ${b.type==='Fluid'?'border-dashed border-stone-400':'border-solid border-stone-500'}`}><p className="font-medium">{b.title}</p><p className="mt-1 text-[11px]">{b.start} - {b.end}</p><p className="mt-1 text-[10px] uppercase">{b.category} - {b.type}</p></div>)}</div>)}</div>)}</div></div></section>
  </div>
}
