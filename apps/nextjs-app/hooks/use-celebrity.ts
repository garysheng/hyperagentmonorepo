import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Celebrity } from '@/types'
import { useUserProfile } from './use-user-profile'

export function useCelebrity() {
  const { data: user } = useUserProfile()
  const supabase = createClient()

  return useQuery({
    queryKey: ['celebrity', user?.celebrity_id],
    queryFn: async () => {
      if (!user?.celebrity_id) {
        throw new Error('No celebrity ID available')
      }

      const { data, error } = await supabase
        .from('celebrities')
        .select('*')
        .eq('id', user.celebrity_id)
        .single() as { data: Celebrity | null, error: any }

      if (error) {
        console.error('Error fetching celebrity:', error)
        throw error
      }

      if (!data) {
        throw new Error('Celebrity not found')
      }

      return data
    },
    enabled: !!user?.celebrity_id
  })
} 