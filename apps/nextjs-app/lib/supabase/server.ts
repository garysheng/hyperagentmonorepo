import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function createServerClient() {
  const cookieStore = await cookies()
  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie: ResponseCookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(newCookies) {
          newCookies.map(({ name, value, ...options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
      },
    }
  )
} 