import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/providers/auth-provider'

interface Celebrity {
  id: string
  celebrity_name: string
  created_at?: string
}

export function useCelebrities() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['celebrities'],
    queryFn: async () => {
      if (!user) {
        throw new Error('You must be authenticated to view celebrities')
      }

      const response = await fetch('/api/celebrities')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch celebrities')
      }

      const data = await response.json()
      return data as Celebrity[]
    },
    enabled: !!user
  })
} 