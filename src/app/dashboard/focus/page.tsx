'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type TrackRow={id:string;title:string;due_date:string|null;time_needed_minutes:number|null;priority:string|null;workflow_status:string|null;status:string|null;completed_at:string|null}
type FocusItem={id:string;title:string;due:string;minutes:number;priority:'Important'|'Normal';scheduled:boolean;overdue:boolean;daysUntil:number;bucket:'Today'|'This Week'|'Later';reason:string}
type BlockRow={track_item_id:string|null;start_at:string;end_at:string}

function startOfDay(date=new Date()){const d=new Date(date);d.setHours(0,0,0,0);return d}
function dayDiff(date:string){const due=new Date(`${date}T12:00:00`),today=startOfDay();return Math.ceil((due.getTime()-today.getTime())/86400000)}
function formatMinutes(m:number){if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return r?`${h} hr ${r} min`:`${h} hr`}
function dueLabel(item:FocusItem){if(item.overdue)return`Overdue by ${Math.abs(item.daysUntil)} day${Math.abs(item.daysUntil)===1?'':'s'}`;if(item.daysUntil===0)return'Due today';if(item.daysUntil===1)return'Due tomorrow';if(item.daysUntil<=7)return`Due in ${item.daysUntil} days`;return new Date(`${item.due}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function reasonFor(item:Omit<FocusItem,'reason'>){const reasons:string[]=[];if(item.overdue)reasons.push('overdue');else if(item.daysUntil<=1)reasons.push('due very soon');else if(item.daysUntil<=7)reasons.push('due this week');if(item.priority==='Important')reasons.push('marked Important');if(!item.scheduled)reasons.push('not scheduled yet');else reasons.push('already has time in My 168');if(item.minutes<=15)reasons.push('quick to complete');return reasons.join(', ')}
function score(item:FocusItem){let s=0;if(item.overdue)s+=120+Math.min(Math.abs(item.daysUntil)*4,40);else if(item.daysUntil===0)s+=100;else if(item.daysUntil===1)s+=80;else if(item.daysUntil<=3)s+=60;else if(item.daysUntil<=7)s+=40;else if(item.daysUntil<=30)s+=15;if(item.priority==='Important')s+=35;if(!item.scheduled)s+=18;else s-=8;if(item.minutes<=15)s+=8;else if(item.minutes<=60)s+=4;return s}

export default function FocusPage(){
 const supabase=useMemo(()=>createClient(),[]),[items,setItems]=useState<FocusItem[]>([]),[loading,setLoading]=useState(true),[message,setMessage]=useState(''),[availableToday,setAvailableToday]=useState(0)
 useEffect(()=>{void loadFocus()},[])
 async function loadFocus(){
  setLoading(true);setMessage('');const{data:{user}}=await supabase.auth.getUser();if(!user){setItems([]);setLoading(false);return}
  const today=startOfDay(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1)
  const [{data:track,error:trackError},{data:blocks,error:blockError}]=await Promise.all([
   supabase.from('track_items').select('id,title,due_date,time_needed_minutes,priority,workflow_status,status,completed_at').order('due_date'),
   supabase.from('time_blocks').select('track_item_id,start_at,end_at').gte('start_at',today.toISOString()).lt('start_at',tomorrow.toISOString())
  ])
  if(trackError||blockError){setMessage(`Could not build Focus: ${trackError?.message||blockError?.message}`);setLoading(false);return}
  const blockRows=(blocks||[]) as BlockRow[],scheduledIds=new Set(blockRows.filter(b=>b.track_item_id).map(b=>b.track_item_id as string))
  const busyMinutes=blockRows.reduce((sum,b)=>sum+Math.max(0,(new Date(b.end_at).getTime()-new Date(b.start_at).getTime())/60000),0)
  setAvailableToday(Math.max(0,18*60-Math.round(busyMinutes)))
  const next=((track||[]) as TrackRow[]).filter(r=>r.due_date&&!r.completed_at&&(r.status||'').toLowerCase()!=='completed'&&r.workflow_status!=='completed'&&r.workflow_status!=='archived').map(r=>{
   const days=dayDiff(r.due_date as string),scheduled=scheduledIds.has(r.id),base={id:r.id,title:r.title,due:r.due_date as string,minutes:r.time_needed_minutes||30,priority:(r.priority||'').toLowerCase()==='important'?'Important' as const:'Normal' as const,scheduled,overdue:days<0,daysUntil:days,bucket:(days<=1?'Today':days<=7?'This Week':'Later') as FocusItem['bucket']};return{...base,reason:reasonFor(base)}
  })
  setItems(next);setLoading(false)
 }
 const ranked=useMemo(()=>[...items].sort((a,b)=>score(b)-score(a)),[items]),topThree=ranked.slice(0,3),quick=ranked.filter(i=>i.minutes<=15&&!i.scheduled).slice(0,3),overdue=items.filter(i=>i.overdue).length,unscheduled=items.filter(i=>!i.scheduled).length
 return <div className="max-w-6xl mx-auto space-y-6">
  <header className="border-b border-stone-200 pb-5"><p className="text-sm text-stone-500">Know what to focus on.</p><h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Focus</h1><p className="text-sm text-stone-500 mt-2 max-w-2xl">Focus reads your real Track responsibilities and My 168 schedule, then surfaces what deserves attention. You do not manage a separate Focus list.</p></header>
  {message&&<div className="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 text-sm text-amber-900">{message}</div>}
  <section className="grid sm:grid-cols-3 gap-3"><div className="border rounded-xl p-5 bg-rose-50"><p className="text-xs uppercase text-stone-500">Overdue</p><p className="text-2xl font-semibold mt-2">{overdue}</p></div><div className="border rounded-xl p-5 bg-blue-50"><p className="text-xs uppercase text-stone-500">Needs scheduling</p><p className="text-2xl font-semibold mt-2">{unscheduled}</p></div><div className="border rounded-xl p-5 bg-stone-50"><p className="text-xs uppercase text-stone-500">Open today</p><p className="text-2xl font-semibold mt-2">{formatMinutes(availableToday)}</p></div></section>
  <section className="bg-white border border-stone-200 rounded-xl overflow-hidden"><div className="p-6 border-b"><h2 className="font-semibold text-stone-900">Needs Attention</h2><p className="text-sm text-stone-500 mt-1">Your top priorities based on due date, importance, time needed, and whether time is already scheduled.</p></div>{loading?<div className="p-12 text-center text-sm text-stone-500">Building your Focus...</div>:topThree.length===0?<div className="p-12 text-center text-sm text-stone-500">Nothing needs attention right now.</div>:<ol className="divide-y">{topThree.map((item,index)=><li key={item.id} className="p-6"><div className="flex gap-4"><span className="w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold flex-shrink-0">{index+1}</span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-stone-900">{item.title}</p>{item.priority==='Important'&&<span className="text-xs border rounded px-2 py-0.5">Important</span>}{item.scheduled&&<span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">Scheduled</span>}</div><p className="text-sm text-stone-500 mt-1">{dueLabel(item)} - {formatMinutes(item.minutes)}</p><p className="text-xs text-stone-400 mt-2">Why this is here: {item.reason}.</p></div></div></li>)}</ol>}</section>
  <section className="grid md:grid-cols-3 gap-4">{(['Today','This Week','Later'] as const).map(bucket=><div key={bucket} className="bg-white border rounded-xl p-5 min-h-[220px]"><div className="flex justify-between border-b pb-3"><h2 className="text-sm font-semibold">{bucket}</h2><span className="text-xs text-stone-400">{ranked.filter(i=>i.bucket===bucket).length}</span></div>{ranked.filter(i=>i.bucket===bucket).map(item=><div key={item.id} className="py-4 border-b last:border-0"><div className="flex justify-between gap-2"><p className="text-sm font-medium">{item.title}</p>{item.scheduled&&<span className="text-[11px] text-blue-700">Scheduled</span>}</div><p className="text-xs text-stone-500 mt-1">{dueLabel(item)} - {formatMinutes(item.minutes)}</p></div>)}</div>)}</section>
  <section className="bg-white border rounded-xl p-6"><h2 className="font-semibold">Quick Tasks</h2><p className="text-sm text-stone-500 mt-1">Unscheduled responsibilities that need 15 minutes or less.</p><div className="grid md:grid-cols-3 gap-3 mt-4">{quick.length?quick.map(item=><div key={item.id} className="border rounded-lg p-4"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-stone-500 mt-1">{formatMinutes(item.minutes)} - {dueLabel(item)}</p></div>):<p className="text-sm text-stone-400">No quick tasks right now.</p>}</div></section>
 </div>
}
