'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import type { DM } from '@/types'
import { DMActions } from './dm-actions'
import { formatDistanceToNow } from 'date-fns'

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
  if (!dm) {
    return (
      <Card className="p-6 h-[calc(100vh-13rem)]">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Select a message to view details
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 h-[calc(100vh-13rem)] flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Image
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${dm.sender_id}`}
            alt={dm.sender_handle}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-medium">@{dm.sender_handle}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(dm.status)}>
            {dm.status}
          </Badge>
          <DMActions dm={dm} />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex-1">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Message
            </h4>
            <p className="text-sm">{dm.initial_content}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Relevance Score
            </h4>
            <p className="text-sm">{dm.relevance_score} / 5</p>
          </div>
          {dm.goal_id && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Assigned Goal
              </h4>
              <p className="text-sm">Goal ID: {dm.goal_id}</p>
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
        </div>
      </div>
    </Card>
  )
} 