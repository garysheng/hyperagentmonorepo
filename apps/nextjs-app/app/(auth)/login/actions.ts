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

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message }
  }

  return { 
    success: true, 
    redirect: '/login',
    message: 'Check your email to confirm your account before logging in'
  }
} 