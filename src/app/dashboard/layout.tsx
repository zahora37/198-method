import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Calendar, Target, Activity, BookOpen, Calculator, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/calculator', label: '168 Calculator', icon: Calculator },
  { href: '/dashboard/weekly-planner', label: 'Weekly Planner', icon: CalendarDays, pro: true },
  { href: '/dashboard/daily-planner', label: 'Daily Planner', icon: Calendar, pro: true },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, pro: true },
  { href: '/dashboard/habits', label: 'Habits', icon: Activity, pro: true },
  { href: '/dashboard/review', label: 'Weekly Review', icon: BookOpen, pro: true },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier ?? 'free'

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-stone-200 flex flex-col fixed h-full">
        <div className="h-16 px-6 flex items-center border-b border-stone-100">
          <Link href="/" className="font-bold text-xl text-stone-900">
            168<span className="text-indigo-600">.</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, pro }) => {
            const locked = pro && tier === 'free'
            return (
              <Link
                key={href}
                href={locked ? '/dashboard' : href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group
                  ${locked ? 'text-stone-300 cursor-default' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {locked && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Pro</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-3">
          {tier === 'free' && (
            <Link
              href="/api/stripe/checkout?plan=pro"
              className="block text-center text-xs font-medium bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Pro →
            </Link>
          )}
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400 truncate">{user.email}</p>
              <p className="text-xs font-medium text-stone-600 capitalize">{tier}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="text-stone-300 hover:text-stone-600 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
