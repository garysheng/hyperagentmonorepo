'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

export function DMFilters() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Filters</h3>
          <p className="text-sm text-muted-foreground">
            Customize your DM view
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup defaultValue="all">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unread" id="unread" />
                <Label htmlFor="unread">Unread</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="read" id="read" />
                <Label htmlFor="read">Read</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="archived" id="archived" />
                <Label htmlFor="archived">Archived</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Minimum Relevance Score</Label>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  )
} 