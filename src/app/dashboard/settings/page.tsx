export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Manage your 168 preferences.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Settings</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          ['Profile', 'Name, account details, and general preferences.'],
          ['Notifications', 'Reminder timing and delivery preferences.'],
          ['Categories', 'Manage the categories used in My 168 and Track.'],
          ['Appearance', 'Theme and accent color customization will live here.'],
          ['Subscription', 'Manage your plan and billing settings.'],
        ].map(([title, description]) => (
          <button key={title} className="w-full text-left p-5 hover:bg-stone-50 transition-colors">
            <p className="text-sm font-medium text-stone-900">{title}</p>
            <p className="text-sm text-stone-500 mt-1">{description}</p>
          </button>
        ))}
      </section>
    </div>
  )
}
