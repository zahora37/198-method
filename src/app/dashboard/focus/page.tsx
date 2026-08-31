export default function FocusPage() {
  const focusItems = [
    { rank: 1, title: 'Submit school form', meta: 'Overdue - 10 min' },
    { rank: 2, title: 'Vehicle registration', meta: 'Due tomorrow - 20 min' },
    { rank: 3, title: 'Certification study', meta: 'This week - 1 hr' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Know what to focus on.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Focus</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Needs Attention</h2>
            <p className="text-sm text-stone-500 mt-1">3 need attention - 7 upcoming - 2 overdue</p>
          </div>
          <p className="text-sm text-stone-500">Available today: 3h 20m</p>
        </div>

        <ol className="divide-y divide-stone-100 border-y border-stone-100">
          {focusItems.map((item) => (
            <li key={item.title} className="flex items-center gap-4 py-5">
              <span className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-sm font-semibold text-stone-600">{item.rank}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-500 mt-1">{item.meta}</p>
              </div>
              <button className="text-sm font-medium text-stone-600 hover:text-stone-900">Schedule</button>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ['Today', 'Items already scheduled for today will appear here.'],
          ['This Week', 'Important work that should be handled this week.'],
          ['Later', 'Future responsibilities that do not need attention yet.'],
        ].map(([title, text]) => (
          <section key={title} className="bg-white border border-stone-200 rounded-xl p-5 min-h-[170px]">
            <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            <p className="text-sm text-stone-500 mt-3 leading-6">{text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
