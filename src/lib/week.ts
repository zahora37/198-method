export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getWeekStartISO(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function getWeekDates(weekStartISO: string): string[] {
  const start = new Date(`${weekStartISO}T00:00:00`)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start)
    dt.setDate(start.getDate() + i)
    return dt.toISOString().slice(0, 10)
  })
}
