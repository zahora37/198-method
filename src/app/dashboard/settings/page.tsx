import SettingsControls from '@/components/SettingsControls'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('tier').eq('id', user.id).single() : { data: null }
  const tier = profile?.tier ?? 'free'
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-stone-200 pb-5">
        <p className="text-sm text-stone-500">Make 168 feel like your system without changing its calm structure.</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mt-1">Settings</h1>
      </header>

      <SettingsControls />

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="mt-2 text-2xl font-semibold">$9<span className="text-sm font-normal text-stone-500"> / month</span></p>
          <p className="mt-2 text-sm text-stone-600">100 Ask 168 questions each month.</p>
          {tier === 'free' ? <Link href="/api/stripe/checkout?plan=pro" className="inline-block mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Choose Pro</Link> : tier === 'pro' ? <p className="mt-5 text-sm text-stone-500">Your current plan</p> : null}
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Premium</h2>
          <p className="mt-2 text-2xl font-semibold">$19<span className="text-sm font-normal text-stone-500"> / month</span></p>
          <p className="mt-2 text-sm text-stone-600">300 Ask 168 questions each month.</p>
          {tier === 'free' ? <Link href="/api/stripe/checkout?plan=premium" className="inline-block mt-5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium">Choose Premium</Link> : tier === 'premium' ? <p className="mt-5 text-sm text-stone-500">Your current plan</p> : null}
        </div>
      </section>
      {tier !== 'free' && <Link href="/api/stripe/portal" className="inline-block text-sm font-medium text-brand-700 underline">Manage or cancel your subscription</Link>}

      <section className="bg-stone-100 rounded-xl p-5"><p className="text-sm font-medium text-stone-900">Free access</p><p className="text-sm text-stone-600 mt-1 leading-6">You can explore 168 without a paid plan. Ask 168 requires Pro or Premium.</p></section>
    </div>
  )
}
