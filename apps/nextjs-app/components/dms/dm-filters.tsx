'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useTeamMembers } from '@/hooks/use-team-members'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface DMFilters {
  statuses: {
    pending: boolean;
    approved: boolean;
    rejected: boolean;
  };
  minRelevanceScore: number;
  assignedTo: string | 'all';
  needsDiscussion: boolean;
}

interface DMFiltersProps {
  filters: DMFilters;
  onFiltersChange: (filters: DMFilters) => void;
}

export function DMFilters({ filters, onFiltersChange }: DMFiltersProps) {
  const { data: teamMembers = [] } = useTeamMembers()

  const handleStatusChange = (status: keyof DMFilters['statuses'], checked: boolean) => {
    onFiltersChange({
      ...filters,
      statuses: {
        ...filters.statuses,
        [status]: checked
      }
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-medium mb-4">Status</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pending"
              checked={filters.statuses.pending}
              onCheckedChange={(checked) => handleStatusChange('pending', checked as boolean)}
            />
            <Label htmlFor="pending">Pending</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="approved"
              checked={filters.statuses.approved}
              onCheckedChange={(checked) => handleStatusChange('approved', checked as boolean)}
            />
            <Label htmlFor="approved">Approved</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rejected"
              checked={filters.statuses.rejected}
              onCheckedChange={(checked) => handleStatusChange('rejected', checked as boolean)}
            />
            <Label htmlFor="rejected">Rejected</Label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Assigned To</h3>
        <Select
          value={filters.assignedTo}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              assignedTo: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            min={-1}
            step={1}
          />
          <div className="text-sm text-muted-foreground">
            Score: {filters.minRelevanceScore === -1 ? 'Unclassified' : `${filters.minRelevanceScore}+`}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="needs-discussion"
          checked={filters.needsDiscussion}
          onCheckedChange={(checked: boolean | 'indeterminate') =>
            onFiltersChange({
              ...filters,
              needsDiscussion: checked as boolean,
            })
          }
        />
        <Label htmlFor="needs-discussion">Needs Team Discussion</Label>
      </div>
    </Card>
  )
} 