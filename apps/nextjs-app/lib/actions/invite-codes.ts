'use server'

import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function generateInviteCode(role: string) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return {
      error: 'You must be logged in to generate invite codes'
    }
  }

  // Get the user's profile to check if they're an admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, celebrity_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return {
      error: 'Failed to fetch user profile'
    }
  }

  if (profile.role !== 'admin') {
    return {
      error: 'Only admins can generate invite codes'
    }
  }

  // Generate a unique code
  const code = nanoid(8)
  
  // Set expiry to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Create the invite code
  const { error: createError } = await supabase
    .from('invite_codes')
    .insert([
      {
        code,
        role,
        celebrity_id: profile.celebrity_id,
        expires_at: expiresAt.toISOString(),
      }
    ])

  if (createError) {
    return {
      error: 'Failed to generate invite code'
    }
  }

  return { success: true }
} 