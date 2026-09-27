'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl text-stone-900">168<span className="text-brand-500">.</span></Link>
          <h1 className="mt-6 text-3xl font-semibold text-stone-900">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">Log in to return to your time, responsibilities, and priorities.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" placeholder="Enter your password" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50">{loading ? 'Logging in...' : 'Log in'}</button>
        </form>

        <Link href="/dashboard" className="block mt-5 w-full text-center border border-stone-300 bg-white text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-100">Explore 168 without signing in</Link>
        <p className="text-center text-sm text-stone-500 mt-6">New to 168? <Link href="/signup" className="text-brand-600 hover:underline font-medium">Create your free account</Link></p>
      </div>
    </div>
  )
}
