'use client'

import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface DMListProps {
  dms: Array<{
    id: string
    sender: {
      username: string
      avatar_url: string
    }
    message: string
    timestamp: Date
    relevance_score: number
    status: 'pending' | 'approved' | 'rejected'
  }>
  selectedDM?: string
  onSelectDM: (id: string) => void
  isLoading?: boolean
}

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
    <Card className="h-[calc(100vh-2rem)] w-80">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="mb-2 text-lg font-semibold">Direct Messages</h2>
          {dms.map((dm, index) => (
            <div key={dm.id}>
              {index > 0 && <Separator className="my-2" />}
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2 p-2',
                  selectedDM === dm.id && 'bg-muted'
                )}
                onClick={() => onSelectDM(dm.id)}
              >
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src={dm.sender.avatar_url}
                    alt={`${dm.sender.username}'s avatar`}
                    className="rounded-full object-cover"
                    fill
                    sizes="40px"
                  />
                </div>
                <div className="flex flex-col items-start gap-1 overflow-hidden">
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-medium">{dm.sender.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {dm.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="w-full truncate text-sm text-muted-foreground">
                    {dm.message}
                  </p>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
} 