import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Make 168 feel like your system without changing its calm structure.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Settings</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Appearance</p>
        <h2 className="text-lg font-semibold text-stone-900 mt-1">Choose your accent color</h2>
        <p className="text-sm text-stone-500 mt-2 leading-6">Your accent is used for small highlights, selected states, progress, and calendar details. The rest of 168 stays clean and neutral.</p>
        <div className="mt-5"><ThemeSwitcher variant="cards" /></div>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {[
          ['Profile', 'Your name, account information, and personal setup preferences.'],
          ['Notifications', 'Choose when 168 should remind you about upcoming responsibilities.'],
          ['Categories', 'Organize the labels used across your time and tracked responsibilities.'],
        ].map(([title, description]) => <button key={title} className="w-full text-left p-5 hover:bg-stone-50"><p className="text-sm font-medium text-stone-900">{title}</p><p className="text-sm text-stone-500 mt-1">{description}</p></button>)}
      </section>

      <section className="bg-stone-100 rounded-xl p-5"><p className="text-sm font-medium text-stone-900">Early access</p><p className="text-sm text-stone-600 mt-1 leading-6">168 is currently free while we learn from early users and improve the experience.</p></section>
    </div>
  )
}
