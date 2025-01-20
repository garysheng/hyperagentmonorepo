'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import type { DM } from '@/app/(dashboard)/dms/actions'
import { Check, X } from 'lucide-react'

interface DMDetailProps {
  dm: DM | undefined
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function DMDetail({ dm, onApprove, onReject }: DMDetailProps) {
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
            src={dm.sender.avatar_url}
            alt={dm.sender.username}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-medium">@{dm.sender.username}</h3>
            <p className="text-sm text-muted-foreground">
              {dm.timestamp.toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge
          variant={
            dm.status === 'approved'
              ? 'default'
              : dm.status === 'rejected'
              ? 'destructive'
              : 'secondary'
          }
        >
          {dm.status}
        </Badge>
      </div>

      <Separator className="my-4" />

      <div className="flex-1">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Message
            </h4>
            <p className="text-sm">{dm.message}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Relevance Score
            </h4>
            <p className="text-sm">{dm.relevance_score} / 5</p>
          </div>
        </div>
      </div>

      {dm.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onReject(dm.id)}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            className="flex-1"
            variant="default"
            onClick={() => onApprove(dm.id)}
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      )}
    </Card>
  )
} 