'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { EmailThread } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Archive, AlertTriangle } from 'lucide-react'

interface EmailThreadListProps {
  threads: EmailThread[]
  selectedThread: EmailThread | null
  onSelectThread: (thread: EmailThread) => void
  isLoading?: boolean
}

function getStatusIcon(status: EmailThread['status']) {
  switch (status) {
    case 'active':
      return <Mail className="h-4 w-4" />
    case 'archived':
      return <Archive className="h-4 w-4" />
    case 'spam':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return null
  }
}

function getStatusBadgeVariant(status: EmailThread['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
      return 'default'
    case 'archived':
      return 'secondary'
    case 'spam':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function EmailThreadList({ threads, selectedThread, onSelectThread, isLoading }: EmailThreadListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2 pr-4">
        {threads.map((thread) => (
          <Card
            key={thread.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-muted/50',
              selectedThread?.id === thread.id && 'bg-muted'
            )}
            onClick={() => onSelectThread(thread)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(thread.status)}
                    <h4 className="font-medium line-clamp-1">{thread.subject}</h4>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(thread.status)}
                    className="capitalize"
                  >
                    {thread.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(thread.last_message_at, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
} 