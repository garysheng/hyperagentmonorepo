import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageDraftDialog } from '@/components/outbound/message-draft-dialog'
import type { Opportunity } from '@/types'

interface KanbanColumn {
  id: string
  title: string
  opportunities: Opportunity[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  isLoading?: boolean
  onSendMessage?: (opportunity: Opportunity, message: string) => Promise<void>
}

export function KanbanBoard({ columns, isLoading, onSendMessage }: KanbanBoardProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [isDraftOpen, setIsDraftOpen] = useState(false)

  const handleCardClick = (opportunity: Opportunity) => {
    if (opportunity.status === 'approved') {
      setSelectedOpportunity(opportunity)
      setIsDraftOpen(true)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (selectedOpportunity && onSendMessage) {
      await onSendMessage(selectedOpportunity, message)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {columns.map(column => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {column.opportunities.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px] space-y-4">
              {column.opportunities.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {column.id === 'ready' 
                      ? 'No opportunities ready for outreach yet.'
                      : 'No active conversations at the moment.'}
                  </AlertDescription>
                </Alert>
              ) : (
                column.opportunities.map(opportunity => (
                  <Card 
                    key={opportunity.id} 
                    className={`cursor-pointer hover:bg-muted/50 ${opportunity.status === 'approved' ? 'hover:shadow-md transition-shadow' : ''}`}
                    onClick={() => handleCardClick(opportunity)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">@{opportunity.sender_handle}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {opportunity.initial_content}
                          </p>
                        </div>
                        {opportunity.status === 'conversation_started' && (
                          <MessageCircle className="h-4 w-4 text-blue-500 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-2">
                          {opportunity.goal && (
                            <Badge variant="outline" className="text-xs">
                              {opportunity.goal.name}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(opportunity.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <MessageDraftDialog
        opportunity={selectedOpportunity}
        open={isDraftOpen}
        onOpenChange={setIsDraftOpen}
        onSend={handleSendMessage}
      />
    </>
  )
} 