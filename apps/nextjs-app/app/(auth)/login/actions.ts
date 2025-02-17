'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: { session }, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    if (error.message === 'Email not confirmed') {
      return { error: 'Please check your email to confirm your account before logging in' }
    }
    return { error: error.message }
  }

  if (!session?.user) {
    console.error('No session after login')
    return { error: 'Authentication failed' }
  }

  const { data: userData, error: profileError } = await supabase
    .from('users')
    .select('celebrity_id')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    return { error: 'Failed to fetch user profile' }
  }

  revalidatePath('/', 'layout')
  
  return {
    success: true,
    redirect: userData?.celebrity_id ? '/dashboard' : '/create-celebrity'
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const celebrityId = formData.get('celebrity_id') as string
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: { user }, error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        celebrity_id: celebrityId,
        role: 'admin'
      }
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message }
  }

  if (!user) {
    return { error: 'Failed to create user' }
  }

  // Create user profile with celebrity_id if provided
  if (celebrityId) {
    const { error: profileError } = await supabase
      .from('users')
      .update({
        role: 'admin',
        celebrity_id: celebrityId
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { error: 'Failed to set up user profile' }
    }
  }

  return { 
    success: true, 
    redirect: '/login',
    message: 'Check your email to confirm your account before logging in'
  }
} 