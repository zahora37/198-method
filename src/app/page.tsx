import Link from 'next/link'
import { ArrowRight, Clock, Target, ListChecks, Layers3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-stone-900">168<span className="text-brand-500">.</span></span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">Log in</Link>
            <Link href="/signup" className="text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Create your 168</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8"><Clock className="w-3.5 h-3.5" />Free early access</div>
        <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight text-balance mb-6">You have 168 hours<br /><span className="text-brand-500">every week.</span></h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-4 text-balance">The goal is not to create more time. It is to understand the time you have and use it with intention.</p>
        <p className="text-base text-stone-500 max-w-2xl mx-auto mb-10 leading-7">168 brings your time, responsibilities, and priorities into one calm system so you can see what is already committed, what needs to be remembered, and what deserves your attention next.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800">Create your 168<ArrowRight className="w-4 h-4" /></Link>
          <Link href="/dashboard" className="flex items-center gap-2 border border-stone-300 bg-white text-stone-700 px-6 py-3 rounded-xl font-medium hover:bg-stone-100">Explore first</Link>
        </div>
        <p className="text-sm text-stone-400 mt-5">Free during early access. No payment required.</p>
      </section>

      <section className="bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400 font-medium">Why 168 exists</p>
            <h2 className="text-3xl font-semibold text-stone-900 mt-2">Life should not live in six different places.</h2>
            <p className="text-stone-500 mt-4 leading-7">Calendars hold appointments. Reminder apps hold due dates. Notes hold things you cannot forget. Task lists hold work. Your head holds everything else. 168 is designed to connect those pieces so planning your week reflects your real life.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              [Clock, 'Plan your time', 'Start with the commitments that already own part of your week. 168 shows what remains from your 168 hours.'],
              [ListChecks, 'Track what is due', 'Keep bills, appointments, renewals, deadlines, maintenance, and responsibilities in one dependable place.'],
              [Target, 'Know what to focus on', 'Bring urgency, importance, and available time together so the next step is easier to see.'],
            ].map(([Icon, title, copy], index) => {
              const IconComponent = Icon as typeof Clock
              const tones = ['bg-blue-50 text-blue-600', 'bg-rose-50 text-rose-600', 'bg-emerald-50 text-emerald-600']
              return <div key={title as string} className="border border-stone-200 rounded-2xl p-6"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[index]}`}><IconComponent className="w-5 h-5" /></div><h3 className="font-semibold text-stone-900 mt-5">{title as string}</h3><p className="text-stone-500 text-sm leading-6 mt-2">{copy as string}</p></div>
            })}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
          <div><Layers3 className="w-8 h-8 text-brand-500" /><h2 className="text-3xl font-semibold text-stone-900 mt-5">Built to explain itself.</h2><p className="text-stone-500 mt-4 leading-7">168 guides you as you use it. Each area tells you what belongs there, why it matters, and what happens next without turning the experience into a long tutorial.</p></div>
          <div className="space-y-3">
            {[
              ['My 168', 'Add the time that is already committed so you can see what is truly available.'],
              ['Track', 'Add anything you need to remember, especially responsibilities with a due date or repeat schedule.'],
              ['Focus', 'See the few things that need attention based on timing, importance, and your week.'],
              ['Ask 168', 'Ask practical questions about your time and responsibilities once your system has context.'],
            ].map(([title, copy], index) => <div key={title} className="bg-white border border-stone-200 rounded-xl p-5 flex gap-4"><span className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold shrink-0">{index + 1}</span><div><p className="font-medium text-stone-900">{title}</p><p className="text-sm text-stone-500 mt-1 leading-6">{copy}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="bg-stone-900 text-white"><div className="max-w-5xl mx-auto px-6 py-20 text-center"><h2 className="text-3xl font-semibold">Start with the life you already have.</h2><p className="text-stone-400 max-w-xl mx-auto mt-4 leading-7">Build your 168 around your real commitments, responsibilities, and priorities. You can explore first or create a free account to keep your information.</p><Link href="/signup" className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-xl font-medium hover:bg-stone-100 mt-7">Create your 168<ArrowRight className="w-4 h-4" /></Link></div></section>

      <footer className="border-t border-stone-200 bg-white"><div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-stone-400"><span className="font-bold text-stone-900">168<span className="text-brand-500">.</span></span><span>© {new Date().getFullYear()} 168 Method</span></div></footer>
    </div>
  )
}
