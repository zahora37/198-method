'use client'

import { useEffect, useState } from 'react'

const themes = [
  { name: 'Lavender', value: '#8b7cf6', soft: '#f1efff' },
  { name: 'Sage', value: '#7da98c', soft: '#edf6ef' },
  { name: 'Powder Blue', value: '#78a9d1', soft: '#edf6fc' },
  { name: 'Soft Rose', value: '#c98d9d', soft: '#fbf0f3' },
  { name: 'Peach', value: '#d69b72', soft: '#fcf2ea' },
  { name: 'Sand', value: '#ad9877', soft: '#f6f1e9' },
]

export default function SettingsPage() {
  const [accent, setAccent] = useState('Lavender')

  useEffect(() => {
    const saved = localStorage.getItem('168-accent-theme')
    if (saved && themes.some(theme => theme.name === saved)) setAccent(saved)
  }, [])

  function chooseTheme(name: string) {
    setAccent(name)
    localStorage.setItem('168-accent-theme', name)
    const theme = themes.find(item => item.name === name)
    if (theme) {
      document.documentElement.style.setProperty('--accent', theme.value)
      document.documentElement.style.setProperty('--accent-soft', theme.soft)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Make 168 feel like your system without changing its calm structure.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Settings</h1>
      </header>

      <section className="bg-white border border-stone-200 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Appearance</p>
        <h2 className="text-lg font-semibold text-stone-900 mt-1">Choose your accent color</h2>
        <p className="text-sm text-stone-500 mt-2 leading-6">Your accent is used for small highlights, selected states, progress, and calendar details. The rest of 168 stays clean and neutral.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {themes.map(theme => (
            <button key={theme.name} onClick={() => chooseTheme(theme.name)} className={`text-left border rounded-xl p-4 transition-colors ${accent === theme.name ? 'border-stone-900' : 'border-stone-200 hover:border-stone-300'}`}>
              <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full border border-black/5" style={{ backgroundColor: theme.value }} /><div><p className="text-sm font-medium text-stone-900">{theme.name}</p><p className="text-xs text-stone-400">{accent === theme.name ? 'Selected' : 'Select theme'}</p></div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {[
          ['Profile', 'Your name, account information, and personal setup preferences.'],
          ['Notifications', 'Choose when 168 should remind you about upcoming responsibilities.'],
          ['Categories', 'Organize the labels used across your time and tracked responsibilities.'],
        ].map(([title, description]) => <button key={title} className="w-full text-left p-5 hover:bg-stone-50"><p className="text-sm font-medium text-stone-900">{title}</p><p className="text-sm text-stone-500 mt-1">{description}</p></button>)}
      </section>

      <section className="bg-stone-100 rounded-xl p-5"><p className="text-sm font-medium text-stone-900">Early access</p><p className="text-sm text-stone-600 mt-1 leading-6">168 is currently free while we learn from early users and improve the experience.</p></section>
    </div>
  )
}
