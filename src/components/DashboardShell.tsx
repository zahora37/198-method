'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import ModeSwitcher from '@/components/ModeSwitcher'

export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  return (
    <div className="dashboard-surface min-h-screen w-full overflow-x-hidden bg-stone-50">
      <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-stone-200 bg-white px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-controls="dashboard-sidebar"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="font-semibold text-lg tracking-tight text-stone-900">
          168<span className="text-brand-600">.</span> <span className="hidden text-sm font-normal uppercase tracking-widest text-stone-400 min-[390px]:inline">Method</span>
        </span>
        <div className="ml-auto"><ModeSwitcher compact /></div>
      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/40 lg:hidden"
        />
      )}

      <div
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:translate-x-0 lg:visible ${menuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'}`}
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
        }}
      >
        {sidebar}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-2 text-stone-600 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <main className="min-w-0 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:p-10">{children}</main>
    </div>
  )
}
