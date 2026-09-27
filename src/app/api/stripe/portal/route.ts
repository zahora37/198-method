import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return NextResponse.redirect(new URL('/dashboard/settings', request.url))

  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: new URL('/dashboard/settings', request.url).toString(),
  })
  return NextResponse.redirect(session.url)
}
