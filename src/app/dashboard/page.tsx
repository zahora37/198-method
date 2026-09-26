import Link from 'next/link'

const weekSummary = [
  { label: 'Total', value: '168' },
  { label: 'Planned', value: '131' },
  { label: 'Available', value: '37' },
]

const todaySchedule = [
  { time: '8:00 AM - 5:00 PM', label: 'Work' },
  { time: '6:00 PM - 7:00 PM', label: 'Workout' },
]

const focusItems = [
  { title: 'Submit school form', meta: 'Overdue - 10 min' },
  { title: 'Vehicle registration', meta: 'Due tomorrow - 20 min' },
  { title: 'Certification study', meta: 'This week - 1 hr' },
]

const upcomingItems = [
  { item: 'Electric bill', category: 'Finance', due: 'Sep 2' },
  { item: 'School event', category: 'Family', due: 'Sep 4' },
  { item: 'Subscription renewal', category: 'Subscription', due: 'Sep 7' },
  { item: 'Vehicle registration', category: 'Vehicle', due: 'Sep 10' },
]

const availability = [
  ['Mon', '2h'],
  ['Tue', '1h 30m'],
  ['Wed', '4h'],
  ['Thu', '3h'],
  ['Fri', '5h'],
  ['Sat', '8h'],
  ['Sun', '6h'],
]

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col items-start justify-between gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:gap-6">
        <div>
          <p className="text-sm text-stone-500">{today}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Dashboard</h1>
        </div>
        <p className="text-sm text-stone-500">Plan your time. Track what is due. Know what to focus on.</p>
      </header>

      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Your 168</h2>
            <p className="text-sm text-stone-500 mt-1">Your weekly time balance.</p>
          </div>
          <Link href="/dashboard/my-168" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View My 168
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 border border-stone-200 rounded-lg overflow-hidden">
          {weekSummary.map((item, index) => (
            <div key={item.label} className={`p-5 ${index > 0 ? 'border-t sm:border-l sm:border-t-0 border-stone-200' : ''}`}>
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{item.label}</p>
              <p className="text-3xl font-semibold text-stone-900 mt-2">{item.value}</p>
              <p className="text-xs text-stone-500 mt-1">hours</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: '78%' }} />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500 mt-3">
            <span>Sleep 52h</span>
            <span>Work 40h</span>
            <span>Family 18h</span>
            <span>Health 6h</span>
            <span>Personal 8h</span>
            <span>Other 7h</span>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Today</h2>
              <p className="text-sm text-stone-500 mt-1">Available today: 4h 30m</p>
            </div>
            <Link href="/dashboard/my-168" className="text-sm font-medium text-brand-600 hover:text-brand-700">Open schedule</Link>
          </div>
          <div className="divide-y divide-stone-100 border-y border-stone-100">
            {todaySchedule.map((entry) => (
              <div key={`${entry.time}-${entry.label}`} className="grid grid-cols-[150px_1fr] gap-4 py-4 text-sm">
                <span className="text-stone-500">{entry.time}</span>
                <span className="font-medium text-stone-900">{entry.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Focus</h2>
              <p className="text-sm text-stone-500 mt-1">What needs your attention.</p>
            </div>
            <Link href="/dashboard/focus" className="text-sm font-medium text-brand-600 hover:text-brand-700">View Focus</Link>
          </div>
          <ol className="space-y-4">
            {focusItems.map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-xs font-semibold text-stone-600 flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-stone-900">{item.title}</p>
                  <p className="text-xs text-stone-500 mt-1">{item.meta}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Upcoming</h2>
            <p className="text-sm text-stone-500 mt-1">Responsibilities and dates coming next.</p>
          </div>
          <Link href="/dashboard/track" className="text-sm font-medium text-brand-600 hover:text-brand-700">View Track</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-y border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {upcomingItems.map((row) => (
                <tr key={row.item}>
                  <td className="px-6 py-4 font-medium text-stone-900">{row.item}</td>
                  <td className="px-6 py-4 text-stone-500">{row.category}</td>
                  <td className="px-6 py-4 text-stone-500">{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-stone-900">This Week</h2>
          <p className="text-sm text-stone-500 mt-1 mb-5">Available time by day.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {availability.map(([day, time]) => (
              <div key={day} className="border border-stone-200 rounded-lg px-3 py-4 text-center">
                <p className="text-xs uppercase tracking-wide text-stone-400">{day}</p>
                <p className="text-sm font-semibold text-stone-900 mt-2">{time}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-stone-900">Ask 168</h2>
          <p className="text-sm text-stone-500 mt-1">Ask about your schedule, priorities, or available time.</p>
          <Link
            href="/dashboard/ask-168"
            className="mt-5 block w-full border border-stone-300 rounded-lg px-4 py-3 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
          >
            Ask about your week...
          </Link>
          <div className="flex flex-wrap gap-2 mt-3 text-xs text-stone-500">
            <span>Plan my week</span>
            <span className="text-stone-300">|</span>
            <span>What needs attention?</span>
            <span className="text-stone-300">|</span>
            <span>Find time for something</span>
          </div>
        </section>
      </div>
    </div>
  )
}
