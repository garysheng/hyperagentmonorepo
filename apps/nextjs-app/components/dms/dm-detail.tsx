'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import type { DM } from '@/types'
import { DMActions } from './dm-actions'
import { DMComments } from './dm-comments'
import { DMTags } from './dm-tags'
import { formatDistanceToNow } from 'date-fns'
import { useTeamMembers } from '@/hooks/use-team-members'
import { useOpportunityActions } from '@/hooks/use-opportunity-actions'

interface DMDetailProps {
  dm: DM | null
}

function getStatusBadgeVariant(status: DM['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'approved':
      return 'default'
    case 'rejected':
      return 'destructive'
    case 'on_hold':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function DMDetail({ dm }: DMDetailProps) {
  const { data: teamMembers = [] } = useTeamMembers()
  const actions = useOpportunityActions(dm?.id ?? '')

  console.log('DMDetail - Raw tags:', dm?.tags)
  console.log('DMDetail - Tags type:', dm?.tags ? typeof dm.tags : 'no dm')

  if (!dm) {
    return (
      <Card className="p-6 h-[calc(100vh-13rem)]">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Select a message to view details
        </div>
      </Card>
    )
  }

  const assignedTeamMember = dm.assigned_to 
    ? teamMembers.find(member => member.id === dm.assigned_to)
    : null

  const handleTagsChange = async (newTags: string[]) => {
    if (!dm) return
    console.log('handleTagsChange - Sending tags:', newTags)
    await actions.updateTags(newTags)
  }

  const tagsToPass = Array.isArray(dm.tags) ? dm.tags : []
  console.log('DMDetail - Tags being passed to DMTags:', tagsToPass)

  return (
    <Card className="p-6 h-[calc(100vh-13rem)] flex flex-col">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">@{dm.sender_handle}</h3>
          <Badge variant={getStatusBadgeVariant(dm.status)}>
            {dm.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${dm.sender_id}`}
              alt={dm.sender_handle}
              width={32}
              height={32}
              className="rounded-full"
            />
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
            </p>
          </div>
          <DMActions dm={dm} />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Message
            </h4>
            <p className="text-sm">{dm.initial_content}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Tags
            </h4>
            <DMTags 
              tags={tagsToPass}
              onTagsChange={handleTagsChange} 
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Relevance Score
            </h4>
            <p className="text-sm">{dm.relevance_score === -1 ? 'Unclassified' : `${dm.relevance_score} / 5`}</p>
          </div>
          {assignedTeamMember && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Assigned To
              </h4>
              <div className="flex items-center gap-2">
                <Image
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${assignedTeamMember.id}`}
                  alt={assignedTeamMember.full_name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{assignedTeamMember.full_name}</p>
                  <p className="text-xs text-muted-foreground">{assignedTeamMember.role}</p>
                </div>
              </div>
            </div>
          )}
          {dm.goal && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Assigned Goal
              </h4>
              <div className="space-y-1">
                <p className="text-sm font-medium">{dm.goal.name}</p>
                <p className="text-sm text-muted-foreground">{dm.goal.description}</p>
              </div>
            </div>
          )}
          {dm.needs_discussion && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Team Discussion
              </h4>
              <p className="text-sm">This DM needs team discussion</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Comments
            </h4>
            <DMComments dmId={dm.id} />
          </div>
        </div>
      </div>
    </Card>
  )
} 