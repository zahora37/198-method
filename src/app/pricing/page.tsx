import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    interval: 'Start without a payment method',
    description: 'Plan your week, track responsibilities, and try Ask 168.',
    features: ['My 168 calendar and time balance', 'Track and Focus', '10 Ask 168 questions each month'],
    href: '/signup',
    action: 'Start free',
  },
  {
    name: 'Pro',
    price: '$2.50',
    interval: 'per week, billed weekly',
    description: 'More Ask 168 questions for a fuller planning routine.',
    features: ['Everything in Free', '300 Ask 168 questions each month', 'Manage your subscription in Settings'],
    href: '/api/stripe/checkout?plan=pro',
    action: 'Choose Pro',
  },
]

export default function PricingPage() {
  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <nav className="border-b border-stone-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6"><Link href="/" className="text-xl font-bold">168<span className="text-brand-500">.</span></Link><div className="flex items-center gap-4 text-sm"><Link href="/login" className="text-stone-600 hover:text-stone-900">Log in</Link><Link href="/signup" className="rounded-lg bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800">Get started</Link></div></div></nav>
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Plans</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Find room in your 168.</h1><p className="mt-4 text-stone-600">Start with the planner for free. Upgrade when you need more help from Ask 168.</p></div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">{plans.map(plan=><section key={plan.name} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-semibold">{plan.name}</h2><p className="mt-5 text-4xl font-semibold">{plan.price}</p><p className="mt-1 text-sm text-stone-500">{plan.interval}</p><p className="mt-6 text-sm leading-6 text-stone-600">{plan.description}</p><ul className="my-7 space-y-3 text-sm text-stone-700">{plan.features.map(feature=><li key={feature} className="flex items-start gap-2"><span className="font-semibold text-brand-600" aria-hidden="true">✓</span>{feature}</li>)}</ul><Link href={plan.href} className={`mt-auto rounded-xl px-5 py-3 text-center text-sm font-semibold ${plan.name==='Pro'?'bg-brand-600 text-white hover:bg-brand-700':'border border-stone-300 text-stone-900 hover:bg-stone-50'}`}>{plan.action}</Link></section>)}</div>
      <p className="mt-8 text-sm text-stone-500">Ask 168 allowances reset each calendar month. Pro billing runs weekly. You can manage or cancel Pro in Settings after signing in.</p>
    </main>
  </div>
}
