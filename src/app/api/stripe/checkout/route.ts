import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getStripe, PLANS } from '@/lib/stripe/client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get('plan') as 'pro' | null

  if (!plan || !PLANS[plan]) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login?next=%2Fapi%2Fstripe%2Fcheckout%3Fplan%3Dpro', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const stripe = getStripe()
  if (profile?.stripe_subscription_id) {
    return NextResponse.redirect(new URL('/dashboard/settings?subscription=active', request.url))
  }
  const price = await stripe.prices.retrieve(PLANS[plan].priceId)
  if (price.unit_amount !== PLANS[plan].price * 100 || price.currency !== 'usd' || price.recurring?.interval !== PLANS[plan].interval || !price.active) {
    return NextResponse.json({ error: 'This subscription price is not configured for the selected plan.' }, { status: 503 })
  }
  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { supabase_user_id: user.id, plan },
  })

  return NextResponse.redirect(session.url!)
}
