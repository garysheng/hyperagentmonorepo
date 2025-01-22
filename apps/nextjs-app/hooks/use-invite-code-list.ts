import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from './use-user-profile'
import { useToast } from './use-toast'

interface InviteCodeWithUser {
  id: string
  code: string
  role: string
  created_at: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  user_info: {
    email: string
    raw_user_meta_data: {
      full_name: string
    }
  } | null
}

export function useInviteCodeList() {
  const supabase = createClient()
  const { data: user, isLoading: isLoadingUser, error: userError } = useUserProfile()

  return useQuery({
    queryKey: ['invite-codes', user?.celebrity_id],
    queryFn: async () => {
      if (!user?.celebrity_id) {
        throw new Error('No celebrity ID available')
      }

      if (user.role !== 'admin') {
        throw new Error('Only admins can view invite codes')
      }

      // First get the invite codes
      const { data: inviteCodes, error: inviteError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('celebrity_id', user.celebrity_id)
        .order('created_at', { ascending: false })

      if (inviteError) {
        console.error('Error fetching invite codes:', inviteError)
        throw new Error(inviteError.message || 'Failed to fetch invite codes')
      }

      // Then fetch user details for used codes
      const usedCodes = inviteCodes.filter(code => code.used_by)
      const userDetails = await Promise.all(
        usedCodes.map(async (code) => {
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('email, raw_user_meta_data')
            .eq('id', code.used_by)
            .single()

          if (userError) {
            console.warn(`Failed to fetch user details for code ${code.id}:`, userError)
            return null
          }

          return {
            codeId: code.id,
            userInfo: userData
          }
        })
      )

      // Combine the data
      const codesWithUsers: InviteCodeWithUser[] = inviteCodes.map(code => ({
        ...code,
        user_info: userDetails.find(u => u?.codeId === code.id)?.userInfo || null
      }))

      return codesWithUsers
    },
    enabled: !!user?.celebrity_id && !isLoadingUser && !userError && user.role === 'admin',
    retry: false
  })
} 