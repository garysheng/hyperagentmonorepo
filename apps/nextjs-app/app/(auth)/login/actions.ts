'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    if (error.message === 'Email not confirmed') {
      redirect('/login?message=Please check your email to confirm your account before logging in')
    }
    redirect('/login?message=' + encodeURIComponent(error.message))
  }

  // Check if user has a celebrity assigned
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?message=Authentication failed')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('celebrity_id')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')
  
  // If no celebrity is assigned, redirect to create-celebrity page
  if (!userData?.celebrity_id) {
    redirect('/create-celebrity')
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
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
    redirect('/login?message=' + encodeURIComponent(error.message))
  }

  redirect('/login?message=Check your email to confirm your account before logging in')
} 