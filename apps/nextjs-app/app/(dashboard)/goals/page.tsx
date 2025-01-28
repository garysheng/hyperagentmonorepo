'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useGoals } from '@/hooks/use-goals'
import { Goal } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useTeamMembers } from '@/hooks/use-team-members'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/components/providers'
import { useCelebrity } from '@/hooks/use-celebrity'
import { createClient } from '@/lib/supabase/client'

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  priority: z.number().min(1).max(5),
  default_user_id: z.string().nullable(),
})

type GoalFormValues = z.infer<typeof goalSchema>

interface FormValues {
  name: string
  description: string
  priority: number
  default_user_id: string | null
}

export default function GoalsPage() {
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoals()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: teamMembers = [] } = useTeamMembers()
  const { data: celebrity } = useCelebrity()
  const supabase = createClient()
  const [form, setForm] = useState<FormValues>({
    name: '',
    description: '',
    priority: 3,
    default_user_id: null
  })

  const formRef = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: 3,
      default_user_id: null as string | null
    },
  })

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  useEffect(() => {
    if (selectedGoal) {
      formRef.reset({
        name: selectedGoal.name,
        description: selectedGoal.description || '',
        priority: selectedGoal.priority,
        default_user_id: selectedGoal.default_user_id,
      })
    } else {
      formRef.reset({
        name: '',
        description: '',
        priority: 3,
        default_user_id: null as string | null
      })
    }
  }, [selectedGoal, formRef])

  const onSubmit = async (data: GoalFormValues) => {
    try {
      if (selectedGoal) {
        await updateGoal({
          ...selectedGoal,
          ...data,
        })
      } else {
        await createGoal({
          ...data,
          celebrity_id: '0ca0f921-7ccd-4975-9afb-3bed98367403', // TODO: Get from auth context
        })
      }
      setIsOpen(false)
      setSelectedGoal(null)
    } catch (error) {
      console.error('Error saving goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to save goal',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (goal: Goal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return
    try {
      await deleteGoal(goal.id)
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!celebrity) return

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          celebrity_id: celebrity.id,
          name: form.name,
          description: form.description,
          priority: form.priority,
          default_user_id: form.default_user_id
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Goal created successfully'
      })

      setIsOpen(false)
      setForm({
        name: '',
        description: '',
        priority: 3,
        default_user_id: null
      })
    } catch (error) {
      console.error('Error creating goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to create goal. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Manage your goals and priorities</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedGoal(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGoal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
              <DialogDescription>
                {selectedGoal
                  ? 'Edit your goal details below'
                  : 'Add a new goal to track your priorities'}
              </DialogDescription>
            </DialogHeader>
            <Form {...formRef}>
              <form onSubmit={formRef.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={formRef.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter goal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formRef.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter goal description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formRef.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1-5)</FormLabel>
                      <FormControl>
                        <Slider
                          id="priority"
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value || 3]}
                          onValueChange={([value]) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormDescription>1 is highest priority, 5 is lowest</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formRef.control}
                  name="default_user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Team Member</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        This team member will be automatically assigned to opportunities that match this goal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{selectedGoal ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map(goal => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{goal.name}</CardTitle>
                  <CardDescription>
                    Priority: {goal.priority}
                    {goal.default_user_id && teamMembers.find(m => m.id === goal.default_user_id) && (
                      <> • Assigned to: {teamMembers.find(m => m.id === goal.default_user_id)?.full_name}</>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGoal(goal)
                      setIsOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(goal)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{goal.description || 'No description'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 