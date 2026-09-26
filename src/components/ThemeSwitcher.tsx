'use client'

import { useEffect, useState } from 'react'

const themes = [
  { id: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
  { id: 'teal', label: 'Teal', swatch: '#0d9488' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
] as const

type ThemeId = typeof themes[number]['id']

export default function ThemeSwitcher({ variant = 'dots' }: { variant?: 'dots' | 'cards' }) {
  const [selected, setSelected] = useState<ThemeId>('indigo')

  useEffect(() => {
    const sync = () => {
      const current = document.documentElement.getAttribute('data-theme')
      if (themes.some(theme => theme.id === current)) setSelected(current as ThemeId)
    }
    sync()
    window.addEventListener('168-theme-change', sync)
    const onStorage = (event: StorageEvent) => {
      if (event.key === '168-theme' && themes.some(theme => theme.id === event.newValue)) {
        document.documentElement.setAttribute('data-theme', event.newValue!)
        sync()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('168-theme-change', sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function choose(id: ThemeId) {
    setSelected(id)
    document.documentElement.setAttribute('data-theme', id)
    try { localStorage.setItem('168-theme', id) } catch { /* Keep the choice for this page. */ }
    window.dispatchEvent(new Event('168-theme-change'))
  }

  return (
    <div>
      {variant === 'dots' && <p className="text-xs font-medium text-stone-500 mb-2">Theme</p>}
      <div className={variant === 'cards' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'flex flex-wrap items-center gap-2'}>
        {themes.map(theme => (
          <button
            key={theme.id}
            type="button"
            onClick={() => choose(theme.id)}
            title={theme.label}
            aria-label={`${theme.label} theme`}
            aria-pressed={selected === theme.id}
            className={variant === 'cards'
              ? `flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${selected === theme.id ? 'border-stone-900' : 'border-stone-200 hover:border-stone-300'}`
              : `w-7 h-7 rounded-full transition-transform ${selected === theme.id ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'ring-1 ring-stone-200 hover:scale-105'}`}
            style={variant === 'dots' ? { backgroundColor: theme.swatch } : undefined}
          >
            {variant === 'cards' && <><span className="w-8 h-8 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: theme.swatch }} /><span>{theme.label}</span></>}
          </button>
        ))}
      </div>
    </div>
  )
}
