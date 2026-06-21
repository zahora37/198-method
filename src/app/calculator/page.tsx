'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ArrowRight } from 'lucide-react'

const TOTAL_HOURS = 168

interface Category {
  id: string
  name: string
  hours: number
  target: number
  color: string
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#64748b',
]

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Sleep', hours: 56, target: 56, color: '#6366f1' },
  { id: '2', name: 'Work', hours: 45, target: 40, color: '#8b5cf6' },
  { id: '3', name: 'Commute', hours: 5, target: 3, color: '#06b6d4' },
]

export default function CalculatorPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [newName, setNewName] = useState('')
  const [newHours, setNewHours] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const totalUsed = categories.reduce((sum, c) => sum + c.hours, 0)
  const remaining = TOTAL_HOURS - totalUsed

  function addCategory() {
    if (!newName.trim() || !newHours) return
    const hours = parseFloat(newHours)
    const target = newTarget ? parseFloat(newTarget) : hours
    if (isNaN(hours) || hours < 0) return

    setCategories(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        hours,
        target,
        color: COLORS[prev.length % COLORS.length],
      },
    ])
    setNewName('')
    setNewHours('')
    setNewTarget('')
  }

  function removeCategory(id: string) {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function updateHours(id: string, value: string) {
    const hours = parseFloat(value) || 0
    setCategories(prev => prev.map(c => c.id === id ? { ...c, hours } : c))
  }

  function updateTarget(id: string, value: string) {
    const target = parseFloat(value) || 0
    setCategories(prev => prev.map(c => c.id === id ? { ...c, target } : c))
  }

  const pct = Math.min((totalUsed / TOTAL_HOURS) * 100, 100)

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-stone-900">
            168<span className="text-indigo-600">.</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save results — free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">168-Hour Calculator</h1>
          <p className="text-stone-500">Add every area of life that takes time. There are 168 hours in a week — where do yours go?</p>
        </div>

        {/* Summary bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-0.5">Hours accounted for</p>
              <p className="text-3xl font-bold text-stone-900">
                {totalUsed.toFixed(1)}
                <span className="text-lg font-normal text-stone-400"> / 168</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-500 mb-0.5">Remaining</p>
              <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : remaining === 0 ? 'text-emerald-600' : 'text-stone-700'}`}>
                {remaining.toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${remaining < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {remaining < 0 && (
            <p className="text-sm text-red-600 font-medium">
              You&apos;re over by {Math.abs(remaining).toFixed(1)} hours — something has to give.
            </p>
          )}
          {remaining === 0 && (
            <p className="text-sm text-emerald-600 font-medium">
              Perfect — every hour is accounted for.
            </p>
          )}
        </div>

        {/* Category list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Your time categories</h2>

          {categories.map(cat => {
            const gap = cat.target - cat.hours
            return (
              <div key={cat.id} className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-stone-900 flex-1">{cat.name}</span>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Actual hrs/week</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={cat.hours}
                      onChange={e => updateHours(cat.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Target hrs/week</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={cat.target}
                      onChange={e => updateTarget(cat.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {gap !== 0 && (
                  <p className={`text-xs mt-2 font-medium ${gap > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {gap > 0
                      ? `${gap.toFixed(1)}h under target — you have room`
                      : `${Math.abs(gap).toFixed(1)}h over target`}
                  </p>
                )}
              </div>
            )
          })}

          {/* Add category */}
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-stone-700">Add a category</p>
            <input
              type="text"
              placeholder="e.g. Exercise, Family, Reading..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Actual hrs/week"
                value={newHours}
                onChange={e => setNewHours(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Target hrs/week"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={addCategory}
              disabled={!newName.trim() || !newHours}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add category
            </button>
          </div>
        </div>

        {/* Save prompt */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-indigo-900">Want to save this?</p>
            <p className="text-sm text-indigo-600 mt-0.5">Create a free account to save your categories and unlock the full planner.</p>
          </div>
          <Link
            href="/signup"
            className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign up free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  )
}
