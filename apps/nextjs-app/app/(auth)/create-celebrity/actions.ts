'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

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

  // Create service client for user update
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Update the user's role and celebrity_id
  const { error: updateError } = await serviceClient
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

  // Verify the update was successful by checking the user record
  const { data: verifyUser, error: verifyError } = await serviceClient
    .from('users')
    .select('celebrity_id')
    .eq('id', user.id)
    .single()

  if (verifyError || !verifyUser?.celebrity_id) {
    console.error('Verification error:', verifyError)
    return {
      error: 'Failed to verify user update'
    }
  }

  // Force revalidation of the user session
  revalidatePath('/', 'layout')

  return {
    success: true,
    redirect: '/dashboard'
  }
} 