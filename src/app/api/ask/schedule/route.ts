import { createClient } from '@/lib/supabase/server'

type ScheduleItem = { title: string; date: string; startTime: string; endTime: string; category: string; blockType: 'Fixed' | 'Fluid'; startAt: string; endAt: string }

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'SIGN_IN_REQUIRED' }, { status: 401 })
  let items: ScheduleItem[]
  try {
    const body = await req.json()
    items = body.items
    if (!Array.isArray(items) || !items.length || items.length > 60) throw new Error('Invalid items')
    if (!items.every(item => item && typeof item.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && /^\d{2}:\d{2}$/.test(item.startTime) && /^\d{2}:\d{2}$/.test(item.endTime) && typeof item.startAt === 'string' && typeof item.endAt === 'string')) throw new Error('Invalid item')
  } catch {
    return Response.json({ error: 'Review every date and time before adding.' }, { status: 400 })
  }
  try {
    const rows = items.map(item => {
      const start = new Date(item.startAt)
      const end = new Date(item.endAt)
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new Error('Invalid time')
      return { user_id: user.id, title: item.title.trim().slice(0, 100), category: ['Family','Education','Work','Sleep','Health','Home','Personal','Social','Other'].includes(item.category) ? item.category : 'Family', start_at: start.toISOString(), end_at: end.toISOString(), block_type: item.blockType === 'Fluid' ? 'Flexible' : 'Fixed', repeat_rule: 'none', notes: 'Added from Ask 168 schedule import' }
    })
    const { error } = await supabase.from('time_blocks').insert(rows)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ added: rows.length })
  } catch {
    return Response.json({ error: 'Each end time must be later than its start time.' }, { status: 400 })
  }
}
