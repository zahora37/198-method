import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const ALLOWED_TIERS = ['free', 'pro', 'premium']
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const ALLOWED_ROUTES = new Set(['/dashboard/track', '/dashboard/my-168', '/dashboard/focus'])
type ChatMessage = { role: 'user' | 'assistant'; content: string }
type Attachment = { name: string; type: string; data: string }
type AskResult = {
  reply: string
  actions?: { label: string; href: string }[]
  scheduleItems?: { title: string; date: string; startTime: string | null; endTime: string | null; category: string; blockType: 'Fixed' | 'Fluid' }[]
}

function safeResult(raw: string): AskResult {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  const parsed = JSON.parse(cleaned) as AskResult
  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim().slice(0, 900) : 'I could not organize that request.'
  const actions = Array.isArray(parsed.actions)
    ? parsed.actions.filter(action => action && typeof action.label === 'string' && ALLOWED_ROUTES.has(action.href)).slice(0, 2)
    : []
  const scheduleItems = Array.isArray(parsed.scheduleItems)
    ? parsed.scheduleItems.filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.title === 'string').slice(0, 60).map(item => ({
      title: item.title.trim().slice(0, 100),
      date: item.date,
      startTime: /^\d{2}:\d{2}$/.test(item.startTime || '') ? item.startTime : null,
      endTime: /^\d{2}:\d{2}$/.test(item.endTime || '') ? item.endTime : null,
      category: typeof item.category === 'string' ? item.category.slice(0, 40) : 'Family',
      blockType: item.blockType === 'Fluid' ? 'Fluid' as const : 'Fixed' as const,
    }))
    : []
  return { reply, actions, scheduleItems }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return Response.json({ error: 'SIGN_IN_REQUIRED' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  if (profileError) return Response.json({ error: 'Could not verify your plan.' }, { status: 503 })
  if (!ALLOWED_TIERS.includes(profile.tier)) return Response.json({ error: 'UPGRADE_REQUIRED' }, { status: 403 })
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Ask 168 is not configured yet.' }, { status: 503 })

  let messages: ChatMessage[]
  let attachment: Attachment | null = null
  try {
    if (Number(req.headers.get('content-length')) > 8_000_000) throw new Error('Too large')
    const body = await req.json()
    if (!Array.isArray(body.messages) || body.messages.length > 16 || !body.messages.length) throw new Error('Invalid messages')
    if (!body.messages.every((m: ChatMessage) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() && m.content.length <= 4000)) throw new Error('Invalid messages')
    messages = body.messages
    if (messages[messages.length - 1].role !== 'user') throw new Error('Last message must be from user')
    if (body.attachment) {
      if (typeof body.attachment.name !== 'string' || typeof body.attachment.type !== 'string' || typeof body.attachment.data !== 'string' || body.attachment.data.length > 7_000_000) throw new Error('Invalid attachment')
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(body.attachment.type)) throw new Error('Unsupported attachment')
      attachment = body.attachment
    }
  } catch {
    return Response.json({ error: 'Use a shorter message or a PDF/image under 5 MB.' }, { status: 400 })
  }

  const { data: quotaRows, error: quotaError } = await supabase.rpc('claim_ask_168_question')
  const quota = Array.isArray(quotaRows) ? quotaRows[0] : null
  if (quotaError || !quota) return Response.json({ error: 'Ask 168 usage is not set up yet.' }, { status: 503 })
  if (!quota.allowed) return Response.json({ error: 'MONTHLY_LIMIT_REACHED', used: quota.used, limit: quota.monthly_limit }, { status: 429 })

  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const [{ data: track, error: trackError }, { data: blocks, error: blocksError }] = await Promise.all([
    supabase.from('track_items').select('title,category,due_date,time_needed_minutes,priority,workflow_status,status').eq('user_id', user.id).not('workflow_status', 'in', '(completed,archived)').order('due_date', { ascending: true }).limit(30),
    supabase.from('time_blocks').select('title,category,start_at,end_at,block_type').eq('user_id', user.id).gte('start_at', now.toISOString()).lt('start_at', end.toISOString()).order('start_at').limit(100),
  ])
  const context = { today: now.toISOString().slice(0, 10), track: trackError ? [] : track, calendar: blocksError ? [] : blocks }

  const apiMessages: Anthropic.MessageParam[] = messages.slice(-8).map((message, index, recent) => {
    if (attachment && index === recent.length - 1 && message.role === 'user') {
      const fileBlock = attachment.type === 'application/pdf'
        ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: attachment.data }, title: attachment.name }
        : { type: 'image' as const, source: { type: 'base64' as const, media_type: attachment.type as 'image/jpeg' | 'image/png' | 'image/webp', data: attachment.data } }
      return { role: 'user', content: [{ type: 'text', text: message.content }, fileBlock] }
    }
    return { role: message.role, content: message.content }
  })

  try {
    const response = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
      model: MODEL,
      max_tokens: 1400,
      system: `You are Ask 168, a practical planning tool inside the 168 Method app. Sound like a calm human planner, not an AI report. Keep ordinary answers under 90 words. Do not use emojis, generic encouragement, a data-summary section, or more than one short list. Lead with the next decision. Refer to app sections by name: Track stores responsibilities, Focus shows priorities, and My 168 stores calendar blocks. Never claim you changed saved data.

Return only valid JSON with this shape: {"reply":"short answer","actions":[{"label":"Open Track","href":"/dashboard/track"}],"scheduleItems":[]}.
Only use action hrefs /dashboard/track, /dashboard/focus, or /dashboard/my-168. Use no more than two actions.

When a school calendar, holiday calendar, or schedule is attached, extract each clearly stated dated event. Put it in scheduleItems as {"title":"...","date":"YYYY-MM-DD","startTime":"HH:MM" or null,"endTime":"HH:MM" or null,"category":"Family" or "Education","blockType":"Fixed"}. Never invent missing dates or times. Tell the user to review missing times before adding. For ordinary questions, scheduleItems must be empty.

Today: ${context.today}. Saved user data: ${JSON.stringify(context).slice(0, 12000)}`,
      messages: apiMessages,
    })
    const text = response.content.find(block => block.type === 'text')
    if (!text || text.type !== 'text') throw new Error('No response')
    return Response.json(safeResult(text.text), { headers: { 'X-Ask-168-Remaining': String(Math.max(0, quota.monthly_limit - quota.used)) } })
  } catch (error) {
    console.error('Ask 168 request failed', error)
    return Response.json({ error: 'Ask 168 could not organize this request. Try again.' }, { status: 502 })
  }
}
