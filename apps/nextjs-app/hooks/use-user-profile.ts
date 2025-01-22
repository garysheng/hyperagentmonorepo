import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types'

export function useUserProfile() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      // First get the authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Not authenticated')
      }

      // Then get their profile data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single() as { data: User | null, error: any }

      if (error) {
        console.error('Error fetching user profile:', error)
        throw error
      }

      if (!data) {
        throw new Error('User profile not found')
      }

      return data
    }
  })
} 