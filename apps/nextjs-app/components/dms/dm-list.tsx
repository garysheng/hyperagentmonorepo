'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Opportunity as DM } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface DMListProps {
  dms: DM[]
  selectedDM: DM | null
  onSelectDM: (dm: DM) => void
  isLoading?: boolean
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

const isEmail = (handle: string) => handle.includes('@')

export function DMList({ dms, selectedDM, onSelectDM, isLoading }: DMListProps) {
  if (isLoading) {
    return (
      <Card>
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    )
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {dms.map((dm) => (
            <Card
              key={dm.id}
              className={cn(
                "cursor-pointer hover:bg-accent transition-colors",
                selectedDM?.id === dm.id && "bg-accent"
              )}
              onClick={() => onSelectDM(dm)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isEmail(dm.sender_handle) ? dm.sender_handle : `@${dm.sender_handle}`}
                      </span>
                      <Badge variant={getStatusBadgeVariant(dm.status)}>
                        {dm.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dm.initial_content}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}