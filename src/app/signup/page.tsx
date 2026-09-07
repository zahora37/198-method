'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, primary_goal: goal } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setMessage('Your account was created. Check your email to confirm your address, then log in with your password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl text-stone-900">168<span className="text-indigo-500">.</span></Link>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-indigo-600 font-medium">Start with your life</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">Create your 168</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500 max-w-md mx-auto">Tell us just enough to make 168 useful to you. Your account keeps your information together as you build your week.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-1.5">What should we call you?</label>
            <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="First name" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <p className="text-xs text-stone-400 mt-1.5">We use this to make your 168 feel personal.</p>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">Create a password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-stone-700 mb-1.5">What would you most like 168 to help with?</label>
            <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Choose one</option>
              <option value="time">Understand where my time goes</option>
              <option value="responsibilities">Keep up with responsibilities</option>
              <option value="priorities">Know what to focus on</option>
              <option value="balance">Create more balance in my week</option>
              <option value="all">Bring everything together</option>
            </select>
            <p className="text-xs text-stone-400 mt-1.5">This helps us guide your setup. You can change your preferences later.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-800">{message}</div>}
          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50">{loading ? 'Creating your account...' : 'Create my 168'}</button>
        </form>

        <Link href="/dashboard" className="block mt-5 text-center text-sm font-medium text-stone-600 hover:text-stone-900">Explore first without signing in</Link>
        <p className="text-center text-sm text-stone-500 mt-6">Already have an account? <Link href="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link></p>
      </div>
    </div>
  )
}
