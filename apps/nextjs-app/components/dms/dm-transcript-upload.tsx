'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Upload } from 'lucide-react'
import type { Opportunity } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface TranscriptUploadProps {
  opportunity: Opportunity
  onTranscriptProcessed: () => void
}

interface ProcessedTranscript {
  proposedStatus: 'pending' | 'approved' | 'rejected'
  summary: string
  actionRecap: string
}

export function DMTranscriptUpload({ opportunity, onTranscriptProcessed }: TranscriptUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState<ProcessedTranscript | null>(null)
  const { toast } = useToast()

  const handleProcess = async () => {
    if (!transcript.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/opportunities/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          transcript,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process transcript')
      }

      const result = await response.json()
      setProcessedResult(result)
    } catch (error) {
      console.error('Error processing transcript:', error)
      toast({
        title: 'Error',
        description: 'Failed to process transcript. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyChanges = async () => {
    if (!processedResult) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/opportunities/apply-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          transcript,
          ...processedResult,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply changes')
      }

      toast({
        title: 'Success',
        description: 'Transcript processed and changes applied successfully.',
      })
      
      setIsOpen(false)
      onTranscriptProcessed()
    } catch (error) {
      console.error('Error applying changes:', error)
      toast({
        title: 'Error',
        description: 'Failed to apply changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Upload Meeting Transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Meeting Transcript</DialogTitle>
          <DialogDescription>
            Upload a transcript of your team's discussion about this opportunity to automatically process and update its status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!processedResult ? (
            <>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="min-h-[200px]"
              />
              <Button 
                onClick={handleProcess}
                disabled={!transcript.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Transcript'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Proposed Status Change</h4>
                <p className="text-sm">
                  {processedResult.proposedStatus === opportunity.status
                    ? `Keep as ${processedResult.proposedStatus}`
                    : `Change to ${processedResult.proposedStatus}`}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Meeting Summary</h4>
                <ScrollArea className="h-[100px] rounded-md border p-4">
                  <p className="text-sm">{processedResult.summary}</p>
                </ScrollArea>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Action Recap</h4>
                <ScrollArea className="h-[100px] rounded-md border p-4">
                  <p className="text-sm">{processedResult.actionRecap}</p>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setProcessedResult(null)}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleApplyChanges}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying Changes...
                    </>
                  ) : (
                    'Apply Changes'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 