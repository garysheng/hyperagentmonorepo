'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createCelebrity(formData: FormData) {
  const supabase = await createClient()

  const celebrityName = formData.get('celebrityName') as string

  if (!celebrityName) {
    return {
      error: 'Celebrity name is required'
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      error: 'You must be logged in to create a celebrity'
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

  // Update the user's role and celebrity_id
  const { error: userError } = await supabase
    .from('users')
    .update({
      role: 'admin',
      celebrity_id: celebrity.id
    })
    .eq('id', user.id)

  if (userError) {
    return {
      error: 'Failed to update user'
    }
  }

  redirect('/dashboard')
} 