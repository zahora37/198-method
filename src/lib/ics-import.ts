export type ImportedEvent = {
  title: string
  date: string
  startTime: string
  endTime: string
  category: 'Education'
  blockType: 'Fixed'
}

function unescapeText(value: string) {
  return value.replace(/\\[nN]/g, ' ').replace(/\\([,;\\])/g, '$1').trim()
}

function calendarDate(value: string): { date: string; time: string } | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(?:\d{2})?(Z)?)?$/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute, utc] = match
  const date = `${year}-${month}-${day}`
  const dayCheck = new Date(`${date}T12:00:00Z`)
  if (!Number.isFinite(dayCheck.getTime()) || dayCheck.toISOString().slice(0, 10) !== date) return null
  if (!hour) return { date, time: '' }
  if (Number(hour) > 23 || Number(minute) > 59) return null
  if (utc) {
    const local = new Date(`${date}T${hour}:${minute}:00Z`)
    return { date: `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`, time: `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}` }
  }
  return { date, time: `${hour}:${minute}` }
}

export function importIcs(source: string): { items: ImportedEvent[]; warning: string } {
  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const unfolded: string[] = []
  for (const line of lines) {
    if (/^[ \t]/.test(line) && unfolded.length) unfolded[unfolded.length - 1] += line.slice(1)
    else unfolded.push(line)
  }
  const items: ImportedEvent[] = []
  let event: Record<string, string> | null = null
  let skipped = 0
  let recurring = 0
  let timezone = false
  let overnight = false
  for (const line of unfolded) {
    if (line === 'BEGIN:VEVENT') { event = {}; continue }
    if (line === 'END:VEVENT') {
      if (event) {
        if (event.RRULE) recurring++
        const start = calendarDate(event.DTSTART || '')
        const end = calendarDate(event.DTEND || '')
        if (start && event.SUMMARY && items.length < 60) {
          // All-day DTEND is exclusive in iCalendar. Leave times blank for review.
          if (start.time && end?.date !== start.date) overnight = true
          items.push({ title: unescapeText(event.SUMMARY).slice(0, 100), date: start.date, startTime: start.time, endTime: end?.date === start.date ? end.time : '', category: 'Education', blockType: 'Fixed' })
        } else skipped++
      }
      event = null
      continue
    }
    if (!event) continue
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon)
    if (/^DTSTART;TZID=/i.test(key)) timezone = true
    event[key.split(';')[0].toUpperCase()] = line.slice(colon + 1)
  }
  const notes = []
  if (recurring) notes.push(`${recurring} repeating event${recurring === 1 ? '' : 's'}: only the first occurrence was imported`)
  if (timezone) notes.push('Check times against the calendar time zone')
  if (overnight) notes.push('Overnight events need a time you choose for review')
  if (skipped) notes.push(`${skipped} event${skipped === 1 ? '' : 's'} could not be imported (maximum 60)`)
  if (items.some(item => !item.startTime || !item.endTime)) notes.push('Add times to all-day events before saving')
  return { items, warning: notes.join('. ') }
}
