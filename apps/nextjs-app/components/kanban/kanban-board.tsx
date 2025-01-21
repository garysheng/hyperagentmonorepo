import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import type { Opportunity } from '@/types'

interface KanbanColumn {
  id: string
  title: string
  opportunities: Opportunity[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  isLoading?: boolean
}

export function KanbanBoard({ columns, isLoading }: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex gap-4">
        {columns.map(column => (
          <Card key={column.id} className="w-[350px] flex flex-col animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-5 w-8 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-2">
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {columns.map(column => (
        <Card key={column.id} className="w-[350px] flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {column.opportunities.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-2 pr-2">
                {column.opportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="p-3 cursor-pointer hover:bg-accent">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {opportunity.sender_handle.includes('@') 
                            ? opportunity.sender_handle 
                            : `@${opportunity.sender_handle}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {opportunity.initial_content}
                      </p>
                      {opportunity.goal && (
                        <Badge variant="outline" className="text-xs">
                          {opportunity.goal.name}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 