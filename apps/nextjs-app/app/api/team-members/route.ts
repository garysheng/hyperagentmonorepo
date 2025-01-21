import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CookieOptions } from '@supabase/ssr'

interface Cookie {
  name: string
  value: string
  options?: CookieOptions
}

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Array.from(cookieStore.getAll()).map((cookie): Cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesList: Cookie[]) {
          cookiesList.forEach(cookie => {
            if (cookie.options) {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            } else {
              cookieStore.set(cookie.name, cookie.value)
            }
          })
        }
      },
    }
  )

  try {
    const { data: user, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: teamMembers, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('full_name')

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error in team members API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 