import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') ?? 'free'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If user chose a paid plan, redirect to checkout
      if (plan === 'pro' || plan === 'premium') {
        return NextResponse.redirect(`${origin}/api/stripe/checkout?plan=${plan}`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
