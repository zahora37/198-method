export default function Ask168Page() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Support for planning and prioritizing.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Ask 168</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-xl p-6 min-h-[520px] flex flex-col">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-stone-900">How can 168 help?</h2>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-6">
            Ask about your schedule, available time, upcoming responsibilities, or priorities. The assistant will eventually use your 168 data to give practical recommendations.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {['Plan my week', 'What needs attention?', 'Find time for something'].map((prompt) => (
              <button key={prompt} className="text-left border border-stone-200 rounded-lg p-4 text-sm font-medium text-stone-700 hover:border-stone-300 hover:bg-stone-50">
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-stone-300 rounded-lg p-2 flex gap-2">
          <input
            type="text"
            placeholder="Ask about your week..."
            className="flex-1 px-3 py-2 text-sm outline-none bg-transparent text-stone-900 placeholder:text-stone-400"
          />
          <button className="px-4 py-2 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">Send</button>
        </div>
      </section>
    </div>
  )
}
