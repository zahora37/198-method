import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Clock, CalendarDays, Target, Activity } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, created_at')
    .eq('id', user!.id)
    .single()

  const tier = profile?.tier ?? 'free'
  const isPro = tier === 'pro' || tier === 'premium'

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Good to see you</h1>
        <p className="text-stone-500 mt-1">Your week starts with awareness. Let&apos;s build from there.</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/calculator"
          className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">168-Hour Calculator</h3>
          <p className="text-sm text-stone-500">Map where your time goes this week.</p>
          <div className="flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600">
            Open calculator <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {isPro ? (
          <Link
            href="/dashboard/weekly-planner"
            className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Weekly Planner</h3>
            <p className="text-sm text-stone-500">Set this week&apos;s top priorities.</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600">
              Plan this week <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ) : (
          <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-5 relative overflow-hidden">
            <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5 text-stone-400" />
            </div>
            <h3 className="font-semibold text-stone-400 mb-1">Weekly Planner</h3>
            <p className="text-sm text-stone-400">Unlock with Pro.</p>
            <Link
              href="/api/stripe/checkout?plan=pro"
              className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600 hover:underline"
            >
              Upgrade to Pro <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Upgrade banner for free users */}
      {!isPro && (
        <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Unlock the full planning suite</h3>
            <p className="text-indigo-200 text-sm">Weekly Planner, Daily Planner, Goals, Habits, and Weekly Review — all for $9/mo.</p>
          </div>
          <Link
            href="/api/stripe/checkout?plan=pro"
            className="flex-shrink-0 bg-white text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Pro feature grid */}
      {isPro && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: '/dashboard/goals', icon: Target, label: 'Goals', desc: 'Track what matters' },
            { href: '/dashboard/habits', icon: Activity, label: 'Habits', desc: 'Build consistency' },
            { href: '/dashboard/daily-planner', icon: CalendarDays, label: 'Daily Planner', desc: "Plan today's tasks" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <Icon className="w-5 h-5 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-stone-900 text-sm mb-0.5">{label}</h3>
              <p className="text-xs text-stone-500">{desc}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
