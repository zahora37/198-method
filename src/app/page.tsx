import Link from 'next/link'
import { ArrowRight, Clock, BarChart3, Target, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-stone-900">
            168<span className="text-indigo-600">.</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Clock className="w-3.5 h-3.5" />
          Free to start — no credit card
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight text-balance mb-6">
          You get 168 hours<br />
          <span className="text-indigo-600">every single week.</span>
        </h1>

        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 text-balance">
          Most people can&apos;t account for where their time goes. The 168 Method helps
          you see the truth — then build a week that actually reflects what matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/calculator"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-base"
          >
            Try the 168-Hour Calculator
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 text-stone-600 px-6 py-3 rounded-xl font-medium hover:text-stone-900 transition-colors text-base"
          >
            See all features
          </Link>
        </div>
      </section>

      {/* Concept section */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-stone-900">See the truth</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Add your time categories — sleep, work, commute, family, fitness — and instantly see where your 168 hours go.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-stone-900">Find the gaps</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Compare where time goes vs. where you want it to go. The gap is your opportunity.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-stone-900">Plan with intention</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Use weekly and daily planners, habit tracking, and goal-setting to redesign your week from the ground up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">Simple, honest pricing</h2>
          <p className="text-stone-500">Start free. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white border border-stone-200 rounded-2xl p-7 space-y-5">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Free</p>
              <p className="text-3xl font-bold text-stone-900">$0</p>
            </div>
            <ul className="space-y-2.5">
              {['168-Hour Calculator'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center text-sm font-medium border border-stone-300 text-stone-700 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600 rounded-2xl p-7 space-y-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
              Most popular
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-200 mb-1">Pro</p>
              <p className="text-3xl font-bold text-white">$9<span className="text-lg font-normal text-indigo-300">/mo</span></p>
            </div>
            <ul className="space-y-2.5">
              {['168-Hour Calculator', 'Weekly Planner', 'Daily Planner', 'Goals Tracker', 'Habit Tracker', 'Weekly Review'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-indigo-100 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup?plan=pro"
              className="block text-center text-sm font-medium bg-white text-indigo-700 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Start Pro
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-white border border-stone-200 rounded-2xl p-7 space-y-5">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Premium</p>
              <p className="text-3xl font-bold text-stone-900">$19<span className="text-lg font-normal text-stone-400">/mo</span></p>
            </div>
            <ul className="space-y-2.5">
              {['Everything in Pro', 'AI weekly planning', 'AI goal-setting prompts', 'AI reflection prompts'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup?plan=premium"
              className="block text-center text-sm font-medium bg-stone-900 text-white py-2.5 rounded-xl hover:bg-stone-800 transition-colors"
            >
              Start Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h2 className="text-3xl font-bold">Start with your 168 hours.</h2>
          <p className="text-stone-400 max-w-lg mx-auto">
            No complicated setup. Open the calculator, add your categories, and see where your week really goes — right now.
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Try it free — no sign-up needed
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-stone-400">
          <span className="font-bold text-stone-900">168<span className="text-indigo-600">.</span></span>
          <span>© {new Date().getFullYear()} 168 Method</span>
        </div>
      </footer>
    </div>
  )
}
