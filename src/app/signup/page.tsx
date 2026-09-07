'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="font-bold text-2xl text-stone-900">
            168<span className="text-indigo-600">.</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-stone-900">Join 168 early access</h1>
          <p className="mt-2 text-sm text-stone-500">Create a free account so your information can be saved as we continue building.</p>
        </div>

        {sent ? (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-2">
            <p className="font-medium text-indigo-900">Check your inbox</p>
            <p className="text-sm text-indigo-600">We sent a sign-in link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Sending...' : 'Continue with email'}
            </button>
          </form>
        )}

        <Link href="/dashboard" className="block text-center text-sm font-medium text-stone-600 hover:text-stone-900">
          Explore first without signing in
        </Link>

        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
