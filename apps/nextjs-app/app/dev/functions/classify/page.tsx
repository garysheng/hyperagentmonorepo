'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { getDMs } from '@/app/(dashboard)/dms/actions'
import type { DM } from '@/types'
import { Loader2 } from 'lucide-react'

// Dev secret matching the one in the API route
const DEV_SECRET = 'dev_secret_for_testing';

export default function ClassifyPage() {
  const [isClassifying, setIsClassifying] = useState(false)
  const { data: dms, refetch } = useQuery<DM[]>({
    queryKey: ['dms'],
    queryFn: getDMs
  })

  const unclassifiedDMs = dms?.filter(dm => dm.relevance_score === -1) || []

  const handleClassifyAll = async () => {
    try {
      setIsClassifying(true)
      const response = await fetch('/api/classify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DEV_SECRET}`
        }
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const result = await response.json()
      console.log('Classification result:', result)
      await refetch()
    } catch (error) {
      console.error('Error classifying DMs:', error)
    } finally {
      setIsClassifying(false)
    }
  }

  const handleClassifySingle = async (dmId: string) => {
    try {
      setIsClassifying(true)
      const response = await fetch('/api/classify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DEV_SECRET}`
        }
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const result = await response.json()
      console.log('Classification result:', result)
      await refetch()
    } catch (error) {
      console.error('Error classifying DM:', error)
    } finally {
      setIsClassifying(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classify Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Found {unclassifiedDMs.length} unclassified opportunities
          </p>
        </div>
        <Button 
          onClick={handleClassifyAll} 
          disabled={isClassifying || unclassifiedDMs.length === 0}
        >
          {isClassifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Classifying...
            </>
          ) : (
            `Classify All (${unclassifiedDMs.length})`
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {unclassifiedDMs.map(dm => (
          <Card key={dm.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">@{dm.sender_handle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {dm.initial_content}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClassifySingle(dm.id)}
                disabled={isClassifying}
              >
                {isClassifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Classify'
                )}
              </Button>
            </div>
          </Card>
        ))}

        {unclassifiedDMs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No unclassified opportunities found
          </div>
        )}
      </div>
    </div>
  )
} 