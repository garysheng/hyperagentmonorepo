'use server'

import { createClient } from '@/lib/supabase/server'

export async function joinTeam(formData: FormData) {
  const supabase = await createClient()
  const inviteCode = formData.get('inviteCode') as string

  try {
    // Fetch the invite code details
    const { data: invite, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .single()

    if (inviteError || !invite) {
      return {
        error: 'Invalid invite code'
      }
    }

    if (invite.used_at) {
      return {
        error: 'This invite code has already been used'
      }
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return {
        error: 'This invite code has expired'
      }
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        error: 'You must be logged in to join a team'
      }
    }

    // Update the user's role and celebrity_id
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: invite.role,
        celebrity_id: invite.celebrity_id
      })
      .eq('id', user.id)

    if (updateError) {
      return {
        error: 'Failed to update user role'
      }
    }

    // Mark the invite code as used
    const { error: usedError } = await supabase
      .from('invite_codes')
      .update({
        used_at: new Date().toISOString(),
        used_by: user.id
      })
      .eq('code', inviteCode)

    if (usedError) {
      return {
        error: 'Failed to mark invite code as used'
      }
    }

    return { success: true }
  } catch {
    return {
      error: 'An unexpected error occurred'
    }
  }
} 