import { useQuery } from '@tanstack/react-query'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

async function fetchTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch('/api/team-members')
  if (!res.ok) {
    throw new Error('Failed to fetch team members')
  }
  return res.json()
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
  })
} 