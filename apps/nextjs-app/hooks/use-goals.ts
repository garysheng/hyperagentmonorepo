import { Goal } from '@/types'
import { useCallback, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/goals')
      if (!response.ok) throw new Error('Failed to fetch goals')
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch goals',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      })
      if (!response.ok) throw new Error('Failed to create goal')
      const data = await response.json()
      setGoals(prev => [...prev, data])
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      })
      return data
    } catch (error) {
      console.error('Error creating goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  const updateGoal = useCallback(async (goal: Goal) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      })
      if (!response.ok) throw new Error('Failed to update goal')
      const data = await response.json()
      setGoals(prev => prev.map(g => g.id === goal.id ? data : g))
      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      })
      return data
    } catch (error) {
      console.error('Error updating goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete goal')
      setGoals(prev => prev.filter(g => g.id !== id))
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  }
} 