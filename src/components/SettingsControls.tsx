'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { defaultTrackCategories, getCustomTrackCategories, saveCustomTrackCategories } from '@/lib/track-categories'

import { applyTheme, themes } from '@/lib/appearance'

type Section = 'Profile' | 'Notifications' | 'Categories'
const sections: { title: Section; description: string }[] = [
  { title: 'Profile', description: 'Your account and sign-in options.' },
  { title: 'Notifications', description: 'Check the status of reminders.' },
  { title: 'Categories', description: 'Add labels for your Track items.' },
]

export default function SettingsControls() {
  const [accent, setAccent] = useState('Lavender')
  const [open, setOpen] = useState<Section | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('168-accent-theme')
      if (saved && themes.some(theme => theme.name === saved)) setAccent(saved)
    } catch { /* Keep the default accent when storage is unavailable. */ }
    setCustomCategories(getCustomTrackCategories())
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)).catch(() => setEmail(null))
  }, [])

  function chooseTheme(name: string) {
    if (!themes.some(theme => theme.name === name)) return
    setAccent(name)
    applyTheme(name as typeof themes[number]['name'])
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newCategory.trim()
    if (!name) return
    if ([...defaultTrackCategories, ...customCategories].some(category => category.toLowerCase() === name.toLowerCase())) {
      setCategoryError('This category already exists.')
      return
    }
    const next = [...customCategories, name]
    if (!saveCustomTrackCategories(next)) { setCategoryError('This device could not save the category.'); return }
    setCustomCategories(next)
    setNewCategory('')
    setCategoryError('')
  }

  function removeCategory(name: string) {
    const next = customCategories.filter(category => category !== name)
    if (!saveCustomTrackCategories(next)) { setCategoryError('This device could not save the change.'); return }
    setCustomCategories(next)
    setCategoryError('')
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-stone-200 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Appearance</p>
        <h2 className="text-lg font-semibold text-stone-900 mt-1">Choose your accent color</h2>
        <p className="text-sm text-stone-500 mt-2 leading-6">Your accent appears on links, selected states, progress, and calendar details.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {themes.map(theme => (
            <button key={theme.name} type="button" onClick={() => chooseTheme(theme.name)} aria-pressed={accent === theme.name} className={`text-left border rounded-xl p-4 transition-colors ${accent === theme.name ? 'border-accent' : 'border-stone-200 hover:border-stone-300'}`}>
              <div className="flex items-center gap-3"><span className="w-8 h-8 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: theme.value }} /><div><p className="text-sm font-medium text-stone-900">{theme.name}</p><p className="text-xs text-stone-400">{accent === theme.name ? 'Selected' : 'Select theme'}</p></div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {sections.map(({ title, description }) => (
          <div key={title}>
            <button type="button" aria-expanded={open === title} aria-controls={`settings-${title.toLowerCase()}`} onClick={() => setOpen(open === title ? null : title)} className="w-full text-left p-5 hover:bg-stone-50 flex items-center justify-between gap-3">
              <span><span className="block text-sm font-medium text-stone-900">{title}</span><span className="block text-sm text-stone-500 mt-1">{description}</span></span>
              <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${open === title ? 'rotate-180' : ''}`} />
            </button>
            {open === title && <div id={`settings-${title.toLowerCase()}`} className="px-5 pb-5 text-sm text-stone-600">
              {title === 'Profile' && <div className="rounded-lg bg-stone-50 p-4 space-y-3">
                <p>{email ? `Signed in as ${email}` : 'You are exploring as a guest. Sign in to keep your information in your account.'}</p>
                {!email && <div className="flex flex-wrap gap-4"><Link href="/login" className="font-medium text-indigo-700 underline">Sign in</Link><Link href="/signup" className="font-medium text-indigo-700 underline">Create an account</Link></div>}
              </div>}
              {title === 'Notifications' && <div className="rounded-lg bg-stone-50 p-4 space-y-2"><p>Automatic reminders are not active yet. You can review due dates and overdue items in Track.</p><Link href="/dashboard/track" className="inline-block font-medium text-indigo-700 underline">Open Track</Link></div>}
              {title === 'Categories' && <div className="space-y-4">
                <p>Custom labels appear in the Track category menu on this device. Existing items keep their category if you remove a label.</p>
                <div className="flex flex-wrap gap-2">{[...defaultTrackCategories, ...customCategories].map(category => <span key={category} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1">{category}{customCategories.includes(category) && <button type="button" onClick={() => removeCategory(category)} aria-label={`Remove ${category}`} className="font-semibold text-stone-500 hover:text-red-700">×</button>}</span>)}</div>
                <form onSubmit={addCategory} className="flex flex-wrap gap-2"><input aria-label="New category" value={newCategory} onChange={event => setNewCategory(event.target.value)} maxLength={40} placeholder="New category" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2" /><button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">Add category</button></form>
                {categoryError && <p role="alert" className="text-red-700">{categoryError}</p>}
              </div>}
            </div>}
          </div>
        ))}
      </section>

    </div>
  )
}
