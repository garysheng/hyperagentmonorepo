'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCelebrity(formData: FormData) {
  const supabase = await createClient()
  const celebrityName = formData.get('celebrityName') as string

  if (!celebrityName) {
    return {
      error: 'Celebrity name is required'
    }
  }

  // Create the celebrity
  const { data: celebrity, error: celebrityError } = await supabase
    .from('celebrities')
    .insert([
      {
        celebrity_name: celebrityName,
        twitter_username: null,
      }
    ])
    .select()
    .single()

  if (celebrityError) {
    return {
      error: 'Failed to create celebrity'
    }
  }

  // Get or create user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Redirect to sign up with state containing celebrity ID
    const signUpPath = `/signup?celebrity_id=${celebrity.id}`
    redirect(signUpPath)
  }

  // Update the user's role and celebrity_id
  const { error: updateError } = await supabase
    .from('users')
    .update({
      role: 'admin',
      celebrity_id: celebrity.id
    })
    .eq('id', user.id)

  if (updateError) {
    return {
      error: 'Failed to update user'
    }
  }

  redirect('/dashboard')
} 