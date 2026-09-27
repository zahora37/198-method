'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { defaultTrackCategories, getCustomTrackCategories } from '@/lib/track-categories'

type Stage = 'Inbox' | 'This Week' | 'In Progress' | 'Done'
type Priority = 'Normal' | 'Important'
type Filter = 'All' | 'Upcoming' | 'Overdue' | 'Completed'
type TrackItem = { id:string; title:string; category:string; due:string; repeat:string; timeNeededMinutes:number|null; priority:Priority; stage:Stage; autoPay:boolean; notes:string; lastCompletedAt:string|null; scheduled:boolean }
type TrackRow = { id:string; title:string; category:string|null; due_date:string|null; repeat_rule:string|null; time_needed_minutes:number|null; priority:string|null; auto_pay:boolean|null; notes:string|null; workflow_status:string|null; status:string|null; last_completed_at:string|null; completed_at:string|null }
type FormState = { title:string; category:string; due:string; repeat:string; timeNeeded:string; priority:Priority; autoPay:boolean; notes:string }
type ScheduleForm = { date:string; start:string; minutes:string; type:'Fixed'|'Fluid' }

const repeats=['Does not repeat','Weekly','Monthly','Every 3 months','Every 6 months','Yearly','Custom']
const stages:Stage[]=['Inbox','This Week','In Progress','Done']
const emptyForm:FormState={title:'',category:'Personal',due:'',repeat:'Does not repeat',timeNeeded:'',priority:'Normal',autoPay:false,notes:''}
const emptySchedule:ScheduleForm={date:'',start:'18:00',minutes:'30',type:'Fluid'}
const guestItems:TrackItem[]=[{id:'guest-1',title:'Vehicle registration',category:'Vehicle',due:'2026-09-18',repeat:'Yearly',timeNeededMinutes:20,priority:'Important',stage:'This Week',autoPay:false,notes:'',lastCompletedAt:null,scheduled:false}]
const guestStorageKey='168-method-track-guest-items'

function saveGuestItems(items:TrackItem[]){
 try{localStorage.setItem(guestStorageKey,JSON.stringify(items));return true}catch{return false}
}

function stageFromRow(row:TrackRow):Stage{ if((row.status||'').toLowerCase()==='completed'||row.completed_at)return'Done'; if(row.workflow_status==='planned')return'This Week'; if(row.workflow_status==='in_progress')return'In Progress'; if(row.workflow_status==='completed')return'Done'; return'Inbox' }
function workflowFromStage(stage:Stage){ if(stage==='This Week')return'planned'; if(stage==='In Progress')return'in_progress'; if(stage==='Done')return'completed'; return'inbox' }
function todayStart(){const d=new Date();d.setHours(0,0,0,0);return d}
function itemStatus(item:TrackItem):Exclude<Filter,'All'>{if(item.stage==='Done')return'Completed';if(item.due&&new Date(`${item.due}T12:00:00`)<todayStart())return'Overdue';return'Upcoming'}
function formatMinutes(m:number|null){if(!m)return'-';if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return r?`${h} hr ${r} min`:`${h} hr`}
function formatDate(v:string){return v?new Date(`${v}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'-'}
function isUuid(v:string){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
function calendarCategory(category:string){return ['Sleep','Work','Family','Health','Home','Personal','Education','Social','Other'].includes(category)?category:'Other'}

export default function TrackPage(){
 const supabase=useMemo(()=>createClient(),[])
 const [items,setItems]=useState<TrackItem[]>([]),[userId,setUserId]=useState<string|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[formError,setFormError]=useState('')
 const [filter,setFilter]=useState<Filter>('All'),[view,setView]=useState<'List'|'Board'>('List'),[showForm,setShowForm]=useState(false),[draggedId,setDraggedId]=useState<string|null>(null),[editingId,setEditingId]=useState<string|null>(null),[form,setForm]=useState<FormState>(emptyForm)
 const [categories,setCategories]=useState(defaultTrackCategories)
 const [schedulingId,setSchedulingId]=useState<string|null>(null),[scheduleForm,setScheduleForm]=useState<ScheduleForm>(emptySchedule),[scheduleSaving,setScheduleSaving]=useState(false)
 useEffect(()=>{void loadItems()},[])
 useEffect(()=>{
  const sync=()=>setCategories([...defaultTrackCategories,...getCustomTrackCategories()])
  sync()
  window.addEventListener('168-categories-change',sync)
  return ()=>window.removeEventListener('168-categories-change',sync)
 },[])

 async function loadItems(){
  setLoading(true);setMessage('');const{data:authData}=await supabase.auth.getUser();const user=authData.user
  if(!user){
   setUserId(null)
   try{
    const saved=localStorage.getItem(guestStorageKey)
    const parsed=saved?JSON.parse(saved):null
    setItems(Array.isArray(parsed)?parsed:guestItems)
   }catch{setItems(guestItems);setMessage('Guest items could not be loaded on this device.')}
   setLoading(false);return
  }
  setUserId(user.id)
  const [{data,error},{data:scheduledRows,error:scheduleError}]=await Promise.all([
   supabase.from('track_items').select('id,title,category,due_date,repeat_rule,time_needed_minutes,priority,auto_pay,notes,workflow_status,status,last_completed_at,completed_at').order('due_date',{ascending:true}),
   supabase.from('time_blocks').select('track_item_id').not('track_item_id','is',null)
  ])
  if(error){setMessage(`Could not load Track items: ${error.message}`);setItems([])}else{
   const scheduledIds=new Set((scheduledRows||[]).map(row=>row.track_item_id as string))
   setItems((data as TrackRow[]).map(row=>({id:row.id,title:row.title,category:row.category||'Personal',due:row.due_date||'',repeat:row.repeat_rule||'Does not repeat',timeNeededMinutes:row.time_needed_minutes,priority:(row.priority||'').toLowerCase()==='important'?'Important':'Normal',stage:stageFromRow(row),autoPay:Boolean(row.auto_pay),notes:row.notes||'',lastCompletedAt:row.last_completed_at||row.completed_at,scheduled:scheduledIds.has(row.id)})))
  }
  if(scheduleError)setMessage(`Track loaded, but schedule links could not be checked: ${scheduleError.message}`)
  setLoading(false)
 }
 function resetForm(){setForm(emptyForm);setEditingId(null);setShowForm(false);setMessage('');setFormError('')}
 function beginEdit(item:TrackItem){setEditingId(item.id);setForm({title:item.title,category:item.category,due:item.due,repeat:item.repeat,timeNeeded:item.timeNeededMinutes?String(item.timeNeededMinutes):'',priority:item.priority,autoPay:item.autoPay,notes:item.notes});setShowForm(true);setMessage('');setFormError('');window.scrollTo({top:0,behavior:'smooth'})}
 async function saveItem(){
  if(!form.title.trim()||!form.due){setFormError('Add a title and due date before saving.');return}const minutes=form.timeNeeded.trim()?Number(form.timeNeeded):null;if(minutes!==null&&(!Number.isFinite(minutes)||minutes<0)){setFormError('Time needed must be a valid number of minutes.');return}
  setSaving(true);setMessage('');setFormError('');const payload={title:form.title.trim(),category:form.category,due_date:form.due,repeat_rule:form.repeat,time_needed_minutes:minutes===null?null:Math.round(minutes),priority:form.priority,auto_pay:form.autoPay,notes:form.notes.trim()}
  if(!userId){
   const previous=items.find(item=>item.id===editingId)
   const guestItem:TrackItem={id:previous?.id||crypto.randomUUID(),title:payload.title,category:payload.category,due:payload.due_date,repeat:payload.repeat_rule,timeNeededMinutes:payload.time_needed_minutes,priority:payload.priority,stage:previous?.stage||'Inbox',autoPay:payload.auto_pay,notes:payload.notes,lastCompletedAt:previous?.lastCompletedAt||null,scheduled:false}
   const next=previous?items.map(item=>item.id===previous.id?guestItem:item):[...items,guestItem]
   if(saveGuestItems(next)){setItems(next);resetForm()}else setFormError('This device could not save your item. Check that browser storage is enabled.')
   setSaving(false);return
  }
  const result=editingId?await supabase.from('track_items').update(payload).eq('id',editingId):await supabase.from('track_items').insert({...payload,user_id:userId,workflow_status:'inbox'})
  if(result.error)setFormError(`Could not save item: ${result.error.message}`);else{await loadItems();resetForm()}setSaving(false)
 }
 async function moveItem(id:string,stage:Stage){const previous=items.find(i=>i.id===id);if(!previous||previous.stage===stage)return;const completedAt=stage==='Done'?new Date().toISOString():null;if(!userId){const next=items.map(i=>i.id===id?{...i,stage,lastCompletedAt:completedAt}:i);if(saveGuestItems(next))setItems(next);else setMessage('This device could not save the change.');return}const update=stage==='Done'?{workflow_status:workflowFromStage(stage),completed_at:completedAt,last_completed_at:completedAt}:{workflow_status:workflowFromStage(stage),completed_at:null};const{error}=await supabase.from('track_items').update(update).eq('id',id);if(error){setMessage(`Could not move item: ${error.message}`);return}if(stage==='Done'&&previous.stage!=='Done'&&isUuid(id))await supabase.from('track_item_completions').insert({user_id:userId,track_item_id:id,completed_at:completedAt});await loadItems()}
 async function deleteItem(id:string){if(!window.confirm('Delete this Track item?'))return;if(!userId){const next=items.filter(i=>i.id!==id);if(saveGuestItems(next))setItems(next);else setMessage('This device could not save the change.');return}const{error}=await supabase.from('track_items').delete().eq('id',id);if(error)setMessage(`Could not delete item: ${error.message}`);else await loadItems()}
 function beginSchedule(item:TrackItem){setSchedulingId(item.id);setScheduleForm({date:item.due||new Date().toISOString().slice(0,10),start:'18:00',minutes:String(item.timeNeededMinutes||30),type:'Fluid'});setMessage('')}
 async function scheduleItem(){
  const item=items.find(i=>i.id===schedulingId);if(!item||!userId)return;const minutes=Number(scheduleForm.minutes);if(!scheduleForm.date||!scheduleForm.start||!Number.isFinite(minutes)||minutes<=0){setMessage('Choose a date, start time, and time needed.');return}
  const start=new Date(`${scheduleForm.date}T${scheduleForm.start}:00`),end=new Date(start.getTime()+minutes*60000);setScheduleSaving(true);setMessage('Scheduling...')
  let lastError='';for(const dbType of scheduleForm.type==='Fluid'?['Flexible','flexible','Fluid','fluid']:['Fixed','fixed']){const{error}=await supabase.from('time_blocks').insert({user_id:userId,title:item.title,category:calendarCategory(item.category),start_at:start.toISOString(),end_at:end.toISOString(),block_type:dbType,repeat_rule:'none',notes:item.notes,track_item_id:item.id});if(!error){lastError='';break}lastError=error.message;if(!error.message.includes('time_blocks_block_type_check'))break}
  if(lastError){setMessage(`Could not schedule item: ${lastError}`)}else{await supabase.from('track_items').update({workflow_status:'planned'}).eq('id',item.id);setSchedulingId(null);setScheduleForm(emptySchedule);setMessage('Scheduled in My 168.');await loadItems()}setScheduleSaving(false)
 }
 const enriched=useMemo(()=>items.map(i=>({...i,displayStatus:itemStatus(i)})),[items]);const visibleItems=useMemo(()=>enriched.filter(i=>filter==='All'||i.displayStatus===filter).sort((a,b)=>a.due.localeCompare(b.due)),[enriched,filter])
 const counts=useMemo(()=>{const today=todayStart(),seven=new Date(today),monthEnd=new Date(today.getFullYear(),today.getMonth()+1,0,23,59,59);seven.setDate(today.getDate()+7);return{overdue:enriched.filter(i=>i.displayStatus==='Overdue').length,week:enriched.filter(i=>i.displayStatus!=='Completed'&&i.due&&new Date(`${i.due}T12:00:00`)>=today&&new Date(`${i.due}T12:00:00`)<=seven).length,month:enriched.filter(i=>i.displayStatus!=='Completed'&&i.due&&new Date(`${i.due}T12:00:00`)>=today&&new Date(`${i.due}T12:00:00`)<=monthEnd).length,later:enriched.filter(i=>i.displayStatus!=='Completed'&&i.due&&new Date(`${i.due}T12:00:00`)>monthEnd).length}},[enriched])
 return <div className="max-w-7xl mx-auto space-y-6">
  <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5"><div><p className="text-sm text-stone-500">Track what is due.</p><h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Track</h1><p className="text-sm text-stone-500 mt-2 max-w-2xl leading-6">Keep responsibilities in one place, then schedule the work into your 168 when it needs time.</p></div><button onClick={()=>{if(showForm)resetForm();else setShowForm(true)}} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium">{showForm?'Close':'Add Item'}</button></header>
  {!loading&&!userId&&<p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">Guest preview: Track items are saved on this device. Sign in to save items to your account and access them on other devices.</p>}
  {message&&<div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}
  {showForm&&<section className="bg-white border border-stone-200 rounded-xl p-6"><h2 className="font-semibold text-stone-900">{editingId?'Edit Track item':'Add something you need to remember'}</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5"><label className="text-sm text-stone-600 lg:col-span-2">What do you need to track?<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5"/></label><label className="text-sm text-stone-600">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5 bg-white">{categories.map(c=><option key={c}>{c}</option>)}</select></label><label className="text-sm text-stone-600">Due date (required)<input type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5"/></label><label className="text-sm text-stone-600">Repeat<select value={form.repeat} onChange={e=>setForm({...form,repeat:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5 bg-white">{repeats.map(r=><option key={r}>{r}</option>)}</select></label><label className="text-sm text-stone-600">Time needed (minutes)<input type="number" value={form.timeNeeded} onChange={e=>setForm({...form,timeNeeded:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5"/></label><label className="text-sm text-stone-600">Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Priority})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5 bg-white"><option>Normal</option><option>Important</option></select></label><label className="text-sm text-stone-600 flex items-center gap-2 mt-7"><input type="checkbox" checked={form.autoPay} onChange={e=>setForm({...form,autoPay:e.target.checked})}/> Auto-pay</label><label className="text-sm text-stone-600 lg:col-span-3">Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="mt-1.5 w-full border rounded-lg px-3 py-2.5"/></label></div>{formError&&<p role="alert" className="mt-4 text-sm text-red-700">{formError}</p>}<div className="mt-5 flex justify-end gap-2"><button onClick={resetForm} className="px-4 py-2 border rounded-lg">Cancel</button><button disabled={saving} onClick={()=>void saveItem()} className="px-5 py-2 rounded-lg bg-stone-900 text-white">{saving?'Saving...':'Save Item'}</button></div></section>}
  {schedulingId&&<section className="bg-white border border-stone-300 rounded-xl p-6"><h2 className="font-semibold text-stone-900">Schedule in My 168</h2><p className="text-sm text-stone-500 mt-1">Choose when you want to work on {items.find(i=>i.id===schedulingId)?.title}.</p><div className="grid sm:grid-cols-4 gap-4 mt-5"><label className="text-sm">Date<input type="date" value={scheduleForm.date} onChange={e=>setScheduleForm({...scheduleForm,date:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"/></label><label className="text-sm">Start time<input type="time" value={scheduleForm.start} onChange={e=>setScheduleForm({...scheduleForm,start:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"/></label><label className="text-sm">Minutes<input type="number" min="1" value={scheduleForm.minutes} onChange={e=>setScheduleForm({...scheduleForm,minutes:e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"/></label><label className="text-sm">Block type<select value={scheduleForm.type} onChange={e=>setScheduleForm({...scheduleForm,type:e.target.value as 'Fixed'|'Fluid'})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"><option>Fluid</option><option>Fixed</option></select></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setSchedulingId(null)} className="px-4 py-2 border rounded-lg">Cancel</button><button disabled={scheduleSaving} onClick={()=>void scheduleItem()} className="px-5 py-2 rounded-lg bg-stone-900 text-white">{scheduleSaving?'Scheduling...':'Add to My 168'}</button></div></section>}
  <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Overdue',counts.overdue,'bg-rose-50'],['This Week',counts.week,'bg-blue-50'],['This Month',counts.month,'bg-violet-50'],['Later',counts.later,'bg-emerald-50']].map(([l,v,t])=><div key={String(l)} className={`border rounded-xl p-5 ${t}`}><p className="text-xs uppercase text-stone-500">{l}</p><p className="text-2xl font-semibold mt-2">{v}</p></div>)}</section>
  <section className="bg-white border rounded-xl overflow-hidden"><div className="flex flex-wrap justify-between gap-3 p-5 border-b"><div className="flex gap-2 text-sm">{(['All','Upcoming','Overdue','Completed'] as const).map(o=><button key={o} onClick={()=>setFilter(o)} className={`px-3 py-1.5 rounded-md ${filter===o?'bg-stone-900 text-white':'text-stone-600'}`}>{o}</button>)}</div><div className="flex border rounded-lg p-1 text-sm"><button onClick={()=>setView('List')} className={`px-3 py-1.5 ${view==='List'?'bg-stone-100 font-medium':''}`}>List</button><button onClick={()=>setView('Board')} className={`px-3 py-1.5 ${view==='Board'?'bg-stone-100 font-medium':''}`}>Board</button></div></div>
  {loading?<div className="p-12 text-center text-sm">Loading Track...</div>:view==='List'?<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50 text-left text-xs uppercase text-stone-500"><tr><th className="px-5 py-3">Item</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Due</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y">{visibleItems.map(item=><tr key={item.id}><td className="px-5 py-4"><div className="font-medium">{item.title}</div><div className="text-xs text-stone-400">{item.priority}</div></td><td className="px-5 py-4 text-stone-500">{item.category}</td><td className="px-5 py-4 text-stone-500">{formatDate(item.due)}</td><td className="px-5 py-4 text-stone-500">{formatMinutes(item.timeNeededMinutes)}</td><td className="px-5 py-4 text-xs">{item.displayStatus}{item.scheduled&&<span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-blue-700">Scheduled</span>}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-3 text-xs font-medium">{userId&&item.stage!=='Done'&&!item.scheduled&&<button onClick={()=>beginSchedule(item)} className="text-blue-700">Schedule</button>}{item.stage!=='Done'&&<button onClick={()=>void moveItem(item.id,'Done')}>Complete</button>}<button onClick={()=>beginEdit(item)} className="text-stone-600">Edit</button><button onClick={()=>void deleteItem(item.id)} className="text-red-700">Delete</button></div></td></tr>)}</tbody></table></div>:<div className="p-5"><div className="grid gap-4 lg:grid-cols-4">{stages.map(stage=><div key={stage} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(draggedId)void moveItem(draggedId,stage);setDraggedId(null)}} className="rounded-xl border p-3 min-h-[300px]"><h3 className="text-sm font-semibold mb-3">{stage}</h3><div className="space-y-3">{visibleItems.filter(i=>i.stage===stage).map(item=><article key={item.id} draggable onDragStart={()=>setDraggedId(item.id)} className="rounded-xl border bg-white p-4"><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-stone-500 mt-1">Due {formatDate(item.due)} - {formatMinutes(item.timeNeededMinutes)}</p>{item.scheduled&&<p className="text-xs text-blue-700 mt-2">Scheduled in My 168</p>}<div className="mt-3 flex gap-3 text-xs">{userId&&item.stage!=='Done'&&!item.scheduled&&<button onClick={()=>beginSchedule(item)} className="text-blue-700">Schedule</button>}<button onClick={()=>beginEdit(item)}>Edit</button><button onClick={()=>void deleteItem(item.id)} className="text-red-700">Delete</button></div></article>)}</div></div>)}</div></div>}
  </section>
 </div>
}
