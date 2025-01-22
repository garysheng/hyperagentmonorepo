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
  users: {
    full_name: string
    email: string
  } | null
}

export function useInviteCodeList() {
  const supabase = createClient()
  const { data: user, isLoading: isLoadingUser, error: userError } = useUserProfile()
  const { toast } = useToast()

  return useQuery({
    queryKey: ['invite-codes', user?.celebrity_id],
    queryFn: async () => {
      if (!user?.celebrity_id) {
        throw new Error('No celebrity ID available')
      }

      if (user.role !== 'admin') {
        throw new Error('Only admins can view invite codes')
      }

      const { data, error } = await supabase
        .from('invite_codes')
        .select(`
          id,
          code,
          role,
          created_at,
          expires_at,
          used_at,
          used_by,
          users:used_by (
            full_name,
            email
          )
        `)
        .eq('celebrity_id', user.celebrity_id)
        .order('created_at', { ascending: false })
        .returns<InviteCodeWithUser[]>()

      if (error) {
        console.error('Error fetching invite codes:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch invite codes',
          variant: 'destructive',
        })
        throw error
      }

      return data
    },
    enabled: !!user?.celebrity_id && !isLoadingUser && !userError && user.role === 'admin'
  })
} 