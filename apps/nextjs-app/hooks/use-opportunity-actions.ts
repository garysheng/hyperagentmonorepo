import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { OpportunityAction } from '@/types/actions'
import type { DM } from '@/types'

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
  const queryClient = useQueryClient()

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

  const updateStatus = (status: 'approved' | 'rejected' | 'on_hold') =>
    mutation.mutate({
      type: 'update_status',
      payload: { status },
    })

  const addComment = (content: string) =>
    mutation.mutate({
      type: 'add_comment',
      payload: { content },
    })

  return {
    upgradeRelevance,
    downgradeRelevance,
    assignGoal,
    assignUser,
    flagDiscussion,
    updateStatus,
    addComment,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
} 