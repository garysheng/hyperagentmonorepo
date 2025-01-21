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

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  priority: z.number().min(1).max(5),
})

type GoalFormValues = z.infer<typeof goalSchema>

export default function GoalsPage() {
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoals()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: 1,
    },
  })

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  useEffect(() => {
    if (selectedGoal) {
      form.reset({
        name: selectedGoal.name,
        description: selectedGoal.description || '',
        priority: selectedGoal.priority,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        priority: 1,
      })
    }
  }, [selectedGoal, form])

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

  if (loading) {
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>1 is highest priority, 5 is lowest</FormDescription>
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
                  <CardDescription>Priority: {goal.priority}</CardDescription>
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