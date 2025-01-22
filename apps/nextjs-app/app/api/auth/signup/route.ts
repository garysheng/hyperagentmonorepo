import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const supabase = await createClient()

    // Create the user account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin' // Set role as admin by default
        }
      }
    })

    if (signUpError) {
      throw signUpError
    }

    // Create user profile in users table using service role client
    if (authData.user) {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Check if profile already exists
      const { data: existingProfile } = await serviceClient
        .from('users')
        .select()
        .eq('id', authData.user.id)
        .single()

      // Only create profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await serviceClient
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              full_name: fullName,
              role: 'admin'
            }
          ])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw new Error('Failed to create user profile')
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your account before logging in.'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account'
      },
      { status: 500 }
    )
  }
} 