'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

export interface DMFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected'
  minRelevanceScore: number
}

interface DMFiltersProps {
  filters: DMFilters
  onFiltersChange: (filters: DMFilters) => void
}

export function DMFilters({ filters, onFiltersChange }: DMFiltersProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-medium mb-4">Status</h3>
        <RadioGroup
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as DMFilters['status'],
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending">Pending</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id="approved" />
            <Label htmlFor="approved">Approved</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rejected" id="rejected" />
            <Label htmlFor="rejected">Rejected</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Minimum Relevance Score</h3>
        <div className="space-y-4">
          <Slider
            value={[filters.minRelevanceScore]}
            onValueChange={([value]) =>
              onFiltersChange({
                ...filters,
                minRelevanceScore: value,
              })
            }
            max={5}
            min={1}
            step={1}
          />
          <div className="text-sm text-muted-foreground">
            Score: {filters.minRelevanceScore}+
          </div>
        </div>
      </div>
    </Card>
  )
} 