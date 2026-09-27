import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_TIERS = ['free', 'pro', 'premium']
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const ALLOWED_ROUTES = new Set(['/dashboard/track', '/dashboard/my-168', '/dashboard/focus', '/dashboard/focus?find=time'])
const MAX_ATTACHMENT_BYTES = 2_500_000
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    actions: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, href: { type: 'string' } }, required: ['label', 'href'], additionalProperties: false } },
    scheduleItems: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, date: { type: 'string' }, startTime: { type: ['string', 'null'] }, endTime: { type: ['string', 'null'] }, category: { type: 'string' }, blockType: { type: 'string' } }, required: ['title', 'date', 'startTime', 'endTime', 'category', 'blockType'], additionalProperties: false } },
  },
  required: ['reply', 'actions', 'scheduleItems'],
  additionalProperties: false,
} as const
type ChatMessage = { role: 'user' | 'assistant'; content: string }
type Attachment = { name: string; type: string; data: string }
type AskResult = {
  reply: string
  actions?: { label: string; href: string }[]
  scheduleItems?: { title: string; date: string; startTime: string | null; endTime: string | null; category: string; blockType: 'Fixed' | 'Fluid' }[]
}

function safeResult(raw: string, question: string): AskResult {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  const parsed = JSON.parse(cleaned) as AskResult
  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim().slice(0, 900) : 'I could not organize that request.'
  let actions = Array.isArray(parsed.actions)
    ? parsed.actions.filter(action => action && typeof action.label === 'string' && ALLOWED_ROUTES.has(action.href)).slice(0, 2)
    : []
  if (/find\s+(a\s+)?time|find\s+time|where.*fit/i.test(question) && !actions.some(action => action.href === '/dashboard/focus?find=time')) {
    actions = [{ label: 'Find a Time', href: '/dashboard/focus?find=time' }, ...actions].slice(0, 2)
  }
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
  if (profileError || !profile) return Response.json({ error: 'Could not verify your plan.' }, { status: 503 })
  if (!ALLOWED_TIERS.includes(profile.tier)) return Response.json({ error: 'UPGRADE_REQUIRED' }, { status: 403 })
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Ask 168 is not configured yet.' }, { status: 503 })

  let messages: ChatMessage[]
  let attachment: Attachment | null = null
  try {
    if (Number(req.headers.get('content-length')) > 3_500_000) throw new Error('Too large')
    const body = await req.json()
    if (!Array.isArray(body.messages) || body.messages.length > 16 || !body.messages.length) throw new Error('Invalid messages')
    if (!body.messages.every((m: ChatMessage) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() && m.content.length <= 4000)) throw new Error('Invalid messages')
    messages = body.messages
    if (messages[messages.length - 1].role !== 'user') throw new Error('Last message must be from user')
    if (body.attachment) {
      if (typeof body.attachment.name !== 'string' || typeof body.attachment.type !== 'string' || typeof body.attachment.data !== 'string' || body.attachment.data.length > Math.ceil(MAX_ATTACHMENT_BYTES * 4 / 3) + 4) throw new Error('Invalid attachment')
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(body.attachment.type)) throw new Error('Unsupported attachment')
      attachment = body.attachment
    }
  } catch {
    return Response.json({ error: 'Use a shorter message or a PDF/image under 2.5 MB.' }, { status: 400 })
  }

  const cap = profile.tier === 'free' ? 10 : 300
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'
  const { data: usage, error: usageError } = await supabase.from('ask_168_usage').select('question_count').eq('user_id', user.id).eq('month_start', monthStart).maybeSingle()
  if (usageError) return Response.json({ error: 'Ask 168 usage is not set up yet.' }, { status: 503 })
  if ((usage?.question_count || 0) >= cap) return Response.json({ error: 'MONTHLY_LIMIT_REACHED', used: usage?.question_count, limit: cap }, { status: 429 })

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
      max_tokens: attachment ? 8192 : 1600,
      output_config: { format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
      system: `You are Ask 168, a practical planning tool inside the 168 Method app. Sound like a calm human planner, not an AI report. Keep ordinary answers under 90 words. Do not use emojis, generic encouragement, a data-summary section, or more than one short list. Lead with the next decision. Refer to app sections by name: Track stores responsibilities, Focus shows priorities, and My 168 stores calendar blocks. Never claim you changed saved data.

Return only valid JSON with this shape: {"reply":"short answer","actions":[{"label":"Open Track","href":"/dashboard/track"}],"scheduleItems":[]}.
Only use action hrefs /dashboard/track, /dashboard/focus, /dashboard/focus?find=time, or /dashboard/my-168. Use no more than two actions. When the user asks to find time, include {"label":"Find a Time","href":"/dashboard/focus?find=time"}. That link opens Focus and immediately suggests an available time for the highest-priority unscheduled item.

When a school calendar, holiday calendar, or schedule is attached, extract each clearly stated dated event. Put it in scheduleItems as {"title":"...","date":"YYYY-MM-DD","startTime":"HH:MM" or null,"endTime":"HH:MM" or null,"category":"Family" or "Education","blockType":"Fixed"}. Never invent missing dates or times. Tell the user to review missing times before adding. For ordinary questions, scheduleItems must be empty.

Today: ${context.today}. Saved user data: ${JSON.stringify(context).slice(0, 12000)}`,
      messages: apiMessages,
    })
    const text = response.content.find(block => block.type === 'text')
    if (!text || text.type !== 'text' || response.stop_reason === 'max_tokens') throw new Error('INCOMPLETE_AI_RESPONSE')
    const result = safeResult(text.text, messages[messages.length - 1].content)
    const { data: quotaRows, error: quotaError } = await supabase.rpc('claim_ask_168_question')
    const quota = Array.isArray(quotaRows) ? quotaRows[0] : null
    if (quotaError || !quota) return Response.json({ error: 'Ask 168 usage is not set up yet.' }, { status: 503 })
    if (!quota.allowed) return Response.json({ error: 'MONTHLY_LIMIT_REACHED', used: quota.used, limit: quota.monthly_limit }, { status: 429 })
    return Response.json(result, { headers: { 'X-Ask-168-Remaining': String(Math.max(0, quota.monthly_limit - quota.used)) } })
  } catch (error) {
    const status = error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' ? error.status : null
    console.error('Ask 168 request failed', { status, name: error instanceof Error ? error.name : 'Unknown', message: error instanceof Error ? error.message : 'Unknown' })
    if (status === 401) return Response.json({ error: 'The AI connection key is invalid. Update ANTHROPIC_API_KEY in Vercel.' }, { status: 503 })
    if (status === 402 || status === 403) return Response.json({ error: 'The AI provider rejected this account. Check API billing and key access.' }, { status: 503 })
    if (status === 404) return Response.json({ error: 'The configured AI model is unavailable. Check ANTHROPIC_MODEL in Vercel.' }, { status: 503 })
    if (status === 429) return Response.json({ error: 'The AI provider is busy. Please try again shortly.' }, { status: 503 })
    if (error instanceof Error && error.message === 'INCOMPLETE_AI_RESPONSE') return Response.json({ error: 'This document has too many events for one import. Try a shorter calendar.' }, { status: 422 })
    return Response.json({ error: 'Ask 168 could not reach the AI provider. Please try again.' }, { status: 502 })
  }
}
