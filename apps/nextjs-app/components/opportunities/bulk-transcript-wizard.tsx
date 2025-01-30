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
import { useToast } from '@/hooks/use-toast'
import { Loader2, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

interface OpportunityPreview {
  id: string
  relevantSection: string
  confidence: number
  initial_content: string
  status: string
  sender_handle?: string
}

interface BulkTranscriptWizardProps {
  opportunities: Array<{
    id: string
    initial_content: string
    status: string
    sender_handle?: string
  }>
  onProcessComplete: () => void
}

export function BulkTranscriptWizard({ opportunities, onProcessComplete }: BulkTranscriptWizardProps) {
  const [open, setOpen] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const [identifiedOpportunities, setIdentifiedOpportunities] = useState<OpportunityPreview[]>([])
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [proposedChanges, setProposedChanges] = useState<Record<string, { proposedStatus: string, summary: string, actionRecap: string }>>({})
  const [processedOpportunities, setProcessedOpportunities] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handleUpload = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a transcript',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    setStep('processing')
    console.log('Starting transcript analysis...')
    console.log('Transcript content:', transcript.substring(0, 100) + '...')
    
    try {
      console.log('Sending transcript to bulk processing endpoint...')
      const response = await fetch('/api/opportunities/process-bulk-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Bulk processing failed with status:', response.status)
        console.error('Error response:', errorText)
        throw new Error(`Failed to process transcript: ${errorText}`)
      }

      console.log('Got response from bulk processing endpoint')
      const data = await response.json()
      console.log('Response data:', data)
      
      const { opportunities: identified } = data
      console.log(`Found ${identified?.length || 0} opportunities in transcript`)
      
      if (!identified || !Array.isArray(identified)) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format from server')
      }

      // Map the identified opportunities to include original data
      const previews = identified.map((opp: any) => {
        const originalOpp = opportunities.find(o => o.id === opp.id)
        if (!originalOpp) {
          console.warn(`Could not find original opportunity for id: ${opp.id}`)
        }
        return {
          ...opp,
          ...originalOpp
        }
      })
      console.log('Mapped opportunities with original data:', previews)

      setIdentifiedOpportunities(previews)

      // Process each opportunity immediately
      console.log('Starting individual opportunity processing...')
      for (const opportunity of previews) {
        console.log(`Processing opportunity ${opportunity.id}...`)
        console.log('Opportunity data:', opportunity)
        const result = await handleProcessOpportunity(opportunity)
        if (result) {
          console.log(`Got processing result for ${opportunity.id}:`, result)
          setProposedChanges(prev => ({
            ...prev,
            [opportunity.id]: {
              proposedStatus: result.proposedStatus,
              summary: result.summary,
              actionRecap: result.actionRecap
            }
          }))
          setProcessedOpportunities(prev => new Set([...prev, opportunity.id]))
        } else {
          console.error(`Failed to process opportunity ${opportunity.id}`)
        }
      }
      console.log('Finished processing all opportunities')

      setStep('preview')

      if (previews.length === 0) {
        console.log('No opportunities found in transcript')
        toast({
          title: 'No opportunities found',
          description: 'No opportunities were identified in the transcript.',
          variant: 'default'
        })
      }
    } catch (error: any) {
      console.error('Error in handleUpload:', error)
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to process transcript. Please try again.',
        variant: 'destructive'
      })
      setStep('upload')
    } finally {
      console.log('Transcript analysis complete')
      setIsProcessing(false)
    }
  }

  const handleProcessOpportunity = async (opportunity: OpportunityPreview) => {
    try {
      setIsProcessing(true)
      const response = await fetch('/api/opportunities/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          transcript: opportunity.relevantSection
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process opportunity')
      }

      const result = await response.json()
      
      return result
    } catch (error) {
      console.error('Error processing opportunity:', error)
      toast({
        title: 'Error',
        description: 'Failed to process opportunity. Please try again.',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyChanges = async (opportunityId: string, changes: any) => {
    try {
      setIsProcessing(true)
      const opportunity = identifiedOpportunities.find(opp => opp.id === opportunityId)
      if (!opportunity) {
        console.error('Opportunity not found:', opportunityId)
        throw new Error('Opportunity not found')
      }

      // Get the proposed changes for this opportunity
      const proposedChange = proposedChanges[opportunityId]
      if (!proposedChange) {
        console.error('No proposed changes found for opportunity:', opportunityId)
        throw new Error('No proposed changes found')
      }

      const requestBody = {
        opportunityId,
        transcript: opportunity.relevantSection,
        proposedStatus: proposedChange.proposedStatus,
        summary: proposedChange.summary,
        actionRecap: proposedChange.actionRecap
      }

      console.log('Applying changes for opportunity:', opportunityId)
      console.log('Request body:', requestBody)

      const response = await fetch('/api/opportunities/apply-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        })
        throw new Error(`Failed to apply changes: ${responseText}`)
      }

      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response:', e)
        throw new Error('Invalid response from server')
      }

      console.log('Successfully applied changes:', result)

      // Show success toast
      toast({
        title: 'Success',
        description: 'Changes applied successfully',
        variant: 'default'
      })

      return true
    } catch (error) {
      console.error('Error applying changes:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to apply changes',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNext = async () => {
    const currentOpportunity = identifiedOpportunities[currentOpportunityIndex]
    
    if (!currentOpportunity) return

    // Since we've already processed, just apply changes
    if (proposedChanges[currentOpportunity.id]) {
      const success = await handleApplyChanges(
        currentOpportunity.id, 
        proposedChanges[currentOpportunity.id]
      )

      if (!success) {
        toast({
          title: 'Error',
          description: `Failed to apply changes to opportunity ${currentOpportunityIndex + 1}. Please try again.`,
          variant: 'destructive'
        })
        return
      }

      // Move to next opportunity or finish
      if (currentOpportunityIndex < identifiedOpportunities.length - 1) {
        setCurrentOpportunityIndex(currentOpportunityIndex + 1)
      } else {
        // All done
        toast({
          title: 'Success',
          description: 'All opportunities have been processed.'
        })
        handleReset() // Reset state before closing
        setOpen(false)
        onProcessComplete()
      }
    }
  }

  const handleSkip = () => {
    if (currentOpportunityIndex < identifiedOpportunities.length - 1) {
      setCurrentOpportunityIndex(currentOpportunityIndex + 1)
    } else {
      // If it's the last opportunity, close the wizard
      handleReset()
      setOpen(false)
      onProcessComplete()
    }
  }

  const handleReset = () => {
    setTranscript('')
    setStep('upload')
    setIdentifiedOpportunities([])
    setCurrentOpportunityIndex(0)
    setIsProcessing(false)
    setProposedChanges({})
    setProcessedOpportunities(new Set())
  }

  const currentOpportunity = identifiedOpportunities[currentOpportunityIndex]
  const progress = ((currentOpportunityIndex + 1) / identifiedOpportunities.length) * 100
  const hasProposedChanges = currentOpportunity && proposedChanges[currentOpportunity.id]
  const isProcessed = currentOpportunity && processedOpportunities.has(currentOpportunity.id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload Meeting Transcript</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Process Meeting Transcript</DialogTitle>
          <DialogDescription>
            Upload a transcript to process multiple opportunities at once.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Transcript
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing transcript...</p>
          </div>
        )}

        {step === 'preview' && identifiedOpportunities.length === 0 && (
          <>
            <Alert variant="default" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No opportunities were identified in the transcript. Please check the transcript and try again.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={handleReset}>Try Again</Button>
            </DialogFooter>
          </>
        )}

        {step === 'preview' && currentOpportunity && (
          <>
            <div className="w-full bg-secondary h-2 rounded-full mb-4">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid gap-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Opportunity {currentOpportunityIndex + 1} of {identifiedOpportunities.length}</span>
                      <span className="text-sm text-muted-foreground">
                        from {currentOpportunity.sender_handle?.includes('@') 
                          ? currentOpportunity.sender_handle 
                          : `@${currentOpportunity.sender_handle}`}
                      </span>
                    </div>
                    <Badge variant={currentOpportunity.confidence > 0.7 ? 'default' : 'secondary'}>
                      {Math.round(currentOpportunity.confidence * 100)}% Match
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        Current Status: <Badge variant="secondary">{currentOpportunity.status}</Badge>
                      </div>
                      {hasProposedChanges && (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          <div className="flex items-center gap-1">
                            Proposed Status: <Badge variant={
                              proposedChanges[currentOpportunity.id].proposedStatus === 'approved' ? 'default' :
                              proposedChanges[currentOpportunity.id].proposedStatus === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {proposedChanges[currentOpportunity.id].proposedStatus}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Initial Message</h4>
                      <p className="text-sm text-muted-foreground">{currentOpportunity.initial_content}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-2 font-medium">Relevant Discussion</h4>
                      <ScrollArea className="h-[200px] rounded-md border p-4">
                        <p className="text-sm">{currentOpportunity.relevantSection}</p>
                      </ScrollArea>
                    </div>
                    {hasProposedChanges && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="mb-2 font-medium">Proposed Changes</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Summary</p>
                              <p className="text-sm text-muted-foreground">{proposedChanges[currentOpportunity.id].summary}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Action Items</p>
                              <p className="text-sm text-muted-foreground">{proposedChanges[currentOpportunity.id].actionRecap}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={handleSkip}>
                Skip
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={isProcessing}
                variant={!isProcessed ? 'default' : 'default'}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentOpportunityIndex === identifiedOpportunities.length - 1 ? 'Apply & Finish' : 'Apply & Continue'}
                {!isProcessing && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 