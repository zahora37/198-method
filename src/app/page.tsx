import Link from 'next/link'
import { ArrowRight, Clock, BarChart3, Target, ListChecks } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-stone-900">
            168<span className="text-indigo-600">.</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Log in</Link>
            <Link href="/dashboard" className="text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors">Explore 168</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Clock className="w-3.5 h-3.5" />
          Free early access
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight text-balance mb-6">
          You get 168 hours<br />
          <span className="text-indigo-600">every single week.</span>
        </h1>

        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 text-balance">
          168 helps you plan your time, track what is due, and know what deserves your attention next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-base">
            Explore 168
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/signup" className="flex items-center gap-2 text-stone-600 px-6 py-3 rounded-xl font-medium hover:text-stone-900 transition-colors text-base">
            Create a free account
          </Link>
        </div>
        <p className="text-sm text-stone-400 mt-5">No payment required. Explore first and sign in when you want your information saved.</p>
      </section>

      <section className="bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto"><Clock className="w-6 h-6 text-indigo-600" /></div>
              <h3 className="font-semibold text-stone-900">Plan your time</h3>
              <p className="text-stone-500 text-sm leading-relaxed">See where your 168 hours go and how much time remains available in your week.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto"><ListChecks className="w-6 h-6 text-indigo-600" /></div>
              <h3 className="font-semibold text-stone-900">Track what is due</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Keep responsibilities, renewals, bills, appointments, and deadlines in one place.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto"><Target className="w-6 h-6 text-indigo-600" /></div>
              <h3 className="font-semibold text-stone-900">Know what to focus on</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Bring due dates, priority, and available time together so you can see what needs attention.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Early access</p>
            <h2 className="text-3xl font-bold text-stone-900 mt-2">Help shape 168 while it grows.</h2>
            <p className="text-stone-500 mt-3 max-w-2xl leading-7">We are focused on learning from real users before introducing paid plans. Use the product, test the workflow, and tell us what would make it more useful.</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors whitespace-nowrap">
            Open the app
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
          <BarChart3 className="w-8 h-8 text-indigo-400 mx-auto" />
          <h2 className="text-3xl font-bold">Start with your 168 hours.</h2>
          <p className="text-stone-400 max-w-lg mx-auto">Explore the system without signing in. When you are ready to save your information, create a free account.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Explore free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-stone-400">
          <span className="font-bold text-stone-900">168<span className="text-indigo-600">.</span></span>
          <span>© {new Date().getFullYear()} 168 Method</span>
        </div>
      </footer>
    </div>
  )
}
