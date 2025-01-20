'use client'

import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DM {
  id: string
  sender: {
    username: string
    name: string
    avatar: string
  }
  message: string
  timestamp: string
  relevanceScore: number
  status: 'unread' | 'read' | 'archived'
}

const mockDMs: DM[] = [
  {
    id: '1',
    sender: {
      username: 'johndoe',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    message: 'Hey, I would love to collaborate on a project!',
    timestamp: '2024-01-20T10:00:00Z',
    relevanceScore: 4,
    status: 'unread',
  },
  // Add more mock DMs here
]

export function DMList() {
  return (
    <Card className="col-span-3 h-[calc(100vh-12rem)]">
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {mockDMs.map((dm) => (
            <Card key={dm.id} className="p-4 hover:bg-accent cursor-pointer">
              <div className="flex items-start gap-4">
                <img
                  src={dm.sender.avatar}
                  alt={dm.sender.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{dm.sender.name}</p>
                      <span className="text-sm text-muted-foreground">
                        @{dm.sender.username}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(dm.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{dm.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Relevance: {dm.relevanceScore}/5
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Status: {dm.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
} 