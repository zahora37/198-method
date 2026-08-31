export default function TrackPage() {
  const items = [
    ['Electric bill', 'Finance', 'Sep 2', 'Monthly', '5 min'],
    ['School event', 'Family', 'Sep 4', '-', '2 hr'],
    ['Subscription renewal', 'Subscription', 'Sep 7', 'Monthly', '-'],
    ['Vehicle registration', 'Vehicle', 'Sep 10', 'Yearly', '20 min'],
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-sm text-stone-500">Track what is due.</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Track</h1>
        </div>
        <button className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">Add Item</button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Overdue','2'],['This Week','5'],['This Month','12'],['Later','18']].map(([label,value]) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{label}</p>
            <p className="text-2xl font-semibold text-stone-900 mt-2">{value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap gap-2 p-5 border-b border-stone-200 text-sm">
          {['All','Upcoming','Overdue','Completed'].map((filter, index) => (
            <button key={filter} className={`px-3 py-1.5 rounded-md ${index === 0 ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>{filter}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Due</th>
                <th className="px-6 py-3 font-medium">Repeat</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-6 py-4 ${index === 0 ? 'font-medium text-stone-900' : 'text-stone-500'}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
