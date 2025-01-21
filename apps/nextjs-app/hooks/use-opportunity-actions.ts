import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { OpportunityAction } from '@/types/actions'
import type { Opportunity as DM } from '@/types'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import type { OpportunityStatus } from '@/types'

async function performAction(id: string, action: OpportunityAction): Promise<DM> {
  const response = await fetch(`/api/opportunities/${id}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to perform action')
  }

  return response.json()
}

export function useOpportunityActions(id: string) {
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const mutation = useMutation({
    mutationFn: (action: OpportunityAction) => performAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms'] })
    },
  })

  const upgradeRelevance = (score: number, explanation: string) =>
    mutation.mutate({
      type: 'upgrade_relevance',
      payload: { relevance_score: score, explanation },
    })

  const downgradeRelevance = (explanation: string) =>
    mutation.mutate({
      type: 'downgrade_relevance',
      payload: { explanation },
    })

  const assignGoal = (goalId: string) =>
    mutation.mutate({
      type: 'assign_goal',
      payload: { goal_id: goalId },
    })

  const assignUser = (userId: string) =>
    mutation.mutate({
      type: 'assign_user',
      payload: { user_id: userId },
    })

  const flagDiscussion = (needsDiscussion: boolean) =>
    mutation.mutate({
      type: 'flag_discussion',
      payload: { needs_discussion: needsDiscussion },
    })

  const updateStatus = async (status: OpportunityStatus) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('dms')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['dms'] })
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = (content: string) =>
    mutation.mutate({
      type: 'add_comment',
      payload: { content },
    })

  const updateTags = (tags: string[]) =>
    mutation.mutate({
      type: 'update_tags',
      payload: { tags },
    })

  return {
    upgradeRelevance,
    downgradeRelevance,
    assignGoal,
    assignUser,
    flagDiscussion,
    updateStatus,
    addComment,
    updateTags,
    isLoading,
    error: mutation.error,
  }
} 