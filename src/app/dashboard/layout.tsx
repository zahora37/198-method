import Link from 'next/link'
import DashboardShell from '@/components/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Crosshair,
  MessageSquareText,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/my-168', label: 'My 168', icon: CalendarDays },
  { href: '/dashboard/track', label: 'Track', icon: ListChecks },
  { href: '/dashboard/focus', label: 'Focus', icon: Crosshair },
  { href: '/dashboard/ask-168', label: 'Ask 168', icon: MessageSquareText },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <DashboardShell sidebar={
      <aside className="w-64 h-full min-h-0 bg-white border-r border-stone-200 flex flex-col">
        <div className="h-20 px-6 flex items-center border-b border-stone-100">
          <Link href="/dashboard" className="block">
            <div className="font-semibold text-xl tracking-tight text-stone-900">
              168<span className="text-indigo-600">.</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400 mt-0.5">Method</div>
          </Link>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-5 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <Settings className="w-4 h-4" strokeWidth={1.8} />
            <span>Settings</span>
          </Link>

          <div className="px-3 pt-2 border-t border-stone-100">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  <p className="text-[11px] uppercase tracking-wide text-stone-400 mt-0.5">Early access</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    className="text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-700">Guest preview</p>
                <p className="text-[11px] leading-5 text-stone-400">Explore 168 without an account. Sign in later when you want your information saved.</p>
                <Link href="/login" className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700">Sign in to save</Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    }>
      {children}
    </DashboardShell>
  )
}
