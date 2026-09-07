import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guest preview is allowed across the app. Supabase is used to refresh
  // authenticated sessions when available, but it should never block access.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  try {
    let supabaseResponse = NextResponse.next()

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })

            supabaseResponse = NextResponse.next()

            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    await supabase.auth.getUser()
    return supabaseResponse
  } catch (error) {
    console.error('Supabase middleware error:', error)
    return NextResponse.next()
  }
}
