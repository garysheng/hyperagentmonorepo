import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    const { data: { user }, error: signInError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!signInError && user) {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // If user doesn't exist, create them
      if (!existingUser) {
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            role: 'user'
          })

        if (createError) {
          console.error('Error creating user:', createError)
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
} 