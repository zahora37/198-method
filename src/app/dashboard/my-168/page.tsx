export default function My168Page() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Plan your time.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">My 168</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="grid sm:grid-cols-3 border border-stone-200 rounded-lg overflow-hidden">
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Total</p>
            <p className="text-3xl font-semibold text-stone-900 mt-2">168</p>
            <p className="text-xs text-stone-500 mt-1">hours</p>
          </div>
          <div className="p-5 sm:border-l border-stone-200">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Planned</p>
            <p className="text-3xl font-semibold text-stone-900 mt-2">131</p>
            <p className="text-xs text-stone-500 mt-1">hours</p>
          </div>
          <div className="p-5 sm:border-l border-stone-200">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Available</p>
            <p className="text-3xl font-semibold text-stone-900 mt-2">37</p>
            <p className="text-xs text-stone-500 mt-1">hours</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-xl p-6 min-h-[420px]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Weekly Schedule</h2>
            <p className="text-sm text-stone-500 mt-1">Your fixed and flexible time will live here.</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">Add Time</button>
        </div>
        <div className="border border-dashed border-stone-300 rounded-lg min-h-[300px] flex items-center justify-center text-sm text-stone-400">
          Weekly calendar build coming next
        </div>
      </section>
    </div>
  )
}
