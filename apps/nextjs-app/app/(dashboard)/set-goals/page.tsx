'use client'

import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCelebrity } from '@/hooks/use-celebrity'
import { Skeleton } from '@/components/ui/skeleton'

interface GoalInput {
  name: string
  description: string
  priority: number
}

const DEFAULT_GOALS = [
  { name: '', description: '', priority: 1 },
  { name: '', description: '', priority: 2 },
  { name: '', description: '', priority: 3 },
]

export default function SetGoalsPage() {
  const { user } = useAuth()
  const { data: celebrity, isLoading: isLoadingCelebrity } = useCelebrity()
  const [goals, setGoals] = useState<GoalInput[]>(DEFAULT_GOALS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate that at least one goal is set
    const validGoals = goals.filter(goal => goal.name.trim() && goal.description.trim())
    if (validGoals.length === 0) {
      toast({
        title: 'Error',
        description: 'Please set at least one goal',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get the user's celebrity_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()

      if (!userProfile?.celebrity_id) {
        throw new Error('No celebrity_id found')
      }

      // Insert the goals
      const { error } = await supabase
        .from('goals')
        .insert(
          validGoals.map(goal => ({
            ...goal,
            celebrity_id: userProfile.celebrity_id,
          }))
        )

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Goals have been saved successfully',
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to save goals. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateGoal = (index: number, field: keyof GoalInput, value: string | number) => {
    const newGoals = [...goals]
    newGoals[index] = { ...newGoals[index], [field]: value }
    setGoals(newGoals)
  }

  return (
    <div className="container max-w-4xl py-8 px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">
          {isLoadingCelebrity ? (
            <Skeleton className="h-12 w-[300px]" />
          ) : (
            `Set Goals for ${celebrity?.celebrity_name}`
          )}
        </h1>
        <p className="text-muted-foreground">
          Define the goals for {celebrity?.celebrity_name || 'the celebrity you manage'} to help prioritize and categorize incoming opportunities.
          Set at least one goal to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {goals.map((goal, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Goal {index + 1}</CardTitle>
              <CardDescription>
                Define what the celebrity wants to achieve or the types of opportunities they&apos;re looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder={`e.g., Brand Collaborations for ${celebrity?.celebrity_name}, Speaking Engagements`}
                  value={goal.name}
                  onChange={(e) => updateGoal(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder={`Describe what ${celebrity?.celebrity_name || 'they'} want to achieve with this goal...`}
                  value={goal.description}
                  onChange={(e) => updateGoal(index, 'description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving Goals...' : 'Save Goals'}
        </Button>
      </form>
    </div>
  )
} 