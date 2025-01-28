'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCelebrities } from '@/hooks/use-celebrities'
import { Skeleton } from '@/components/ui/skeleton'

export default function OpportunityGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { data: celebrities, isLoading: isLoadingCelebrities, error: celebritiesError } = useCelebrities()
  const [form, setForm] = useState({
    celebrityId: '',
    count: 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/opportunities/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          celebrityId: form.celebrityId,
          count: form.count
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate opportunities')
      }

      toast({
        title: 'Success',
        description: data.message || `Created ${form.count} test opportunities`,
      })

      // Reset form
      setForm(prev => ({ ...prev, count: 5 }))
    } catch (error) {
      console.error('Error creating test opportunities:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create test opportunities',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (celebritiesError) {
    return (
      <div className="container py-10">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Celebrities</h2>
            <p className="text-muted-foreground">
              {celebritiesError instanceof Error ? celebritiesError.message : 'Failed to load celebrities'}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Bulk Opportunity Generator</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="celebrityId">Celebrity</Label>
            {isLoadingCelebrities ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={form.celebrityId}
                onValueChange={(value) => setForm(prev => ({ ...prev, celebrityId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a celebrity" />
                </SelectTrigger>
                <SelectContent>
                  {celebrities?.map((celebrity) => (
                    <SelectItem key={celebrity.id} value={celebrity.id}>
                      {celebrity.celebrity_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Opportunities (1-25)</Label>
            <div className="pt-2">
              <Slider
                id="count"
                min={1}
                max={25}
                step={1}
                value={[form.count]}
                onValueChange={([value]) => setForm(prev => ({ ...prev, count: value }))}
              />
            </div>
            <p className="text-sm text-muted-foreground text-right">{form.count} opportunities</p>
          </div>

          <Button type="submit" disabled={loading || !form.celebrityId}>
            {loading ? 'Creating...' : 'Generate Test Opportunities'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
