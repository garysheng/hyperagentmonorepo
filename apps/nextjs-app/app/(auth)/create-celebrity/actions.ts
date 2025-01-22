'use server'

import { createClient } from '@/lib/supabase/server'

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
      }
    ])
    .select()
    .single()

  if (celebrityError) {
    console.error('Celebrity creation error:', celebrityError)
    return {
      error: 'Failed to create celebrity'
    }
  }

  // Get or create user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: true,
      redirect: `/signup?celebrity_id=${celebrity.id}`
    }
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
    console.error('User update error:', updateError)
    return {
      error: 'Failed to update user'
    }
  }

  return {
    success: true,
    redirect: '/dashboard'
  }
} 