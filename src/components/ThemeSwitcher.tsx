'use client'

import { useEffect, useState } from 'react'
import { applyTheme, themes, type ThemeName } from '@/lib/appearance'

export default function ThemeSwitcher({ variant = 'dots' }: { variant?: 'dots' | 'cards' }) {
  const [selected, setSelected] = useState<ThemeName>('Lavender')

  useEffect(() => {
    const sync = () => {
      try {
        const saved = localStorage.getItem('168-accent-theme')
        if (themes.some(theme => theme.name === saved)) setSelected(saved as ThemeName)
      } catch { /* Use the default color. */ }
    }
    sync()
    window.addEventListener('168-theme-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('168-theme-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function choose(name: ThemeName) {
    setSelected(name)
    applyTheme(name)
  }

  return (
    <div>
      {variant === 'dots' && <p className="text-xs font-medium text-stone-500 mb-2">Theme</p>}
      <div className={variant === 'cards' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'flex flex-wrap items-center gap-2'}>
        {themes.map(theme => (
          <button key={theme.name} type="button" onClick={() => choose(theme.name)} title={theme.name} aria-label={`${theme.name} theme`} aria-pressed={selected === theme.name}
            className={variant === 'cards' ? `flex items-center gap-3 rounded-xl border p-4 text-left text-sm ${selected === theme.name ? 'border-accent' : 'border-stone-200 hover:border-stone-300'}` : `w-7 h-7 rounded-full ${selected === theme.name ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'ring-1 ring-stone-200 hover:scale-105'}`}
            style={variant === 'dots' ? { backgroundColor: theme.value } : undefined}>
            {variant === 'cards' && <><span className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: theme.value }} /><span>{theme.name}</span></>}
          </button>
        ))}
      </div>
    </div>
  )
}
