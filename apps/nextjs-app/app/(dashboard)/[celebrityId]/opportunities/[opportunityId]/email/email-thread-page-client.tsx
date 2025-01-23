'use client'

import { useState, useEffect, useCallback } from 'react'
import { EmailThreadList } from '@/components/email/email-thread-list'
import { EmailThreadDetail } from '@/components/email/email-thread-detail'
import { createClient } from '@/lib/supabase/client'
import { EmailThread, EmailMessage, TableName } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { RealtimeChannel } from '@supabase/supabase-js'

interface EmailThreadPageClientProps {
    initialThreads: EmailThread[]
    initialMessages: EmailMessage[]
    initialSelectedThread: EmailThread | null
    opportunityId: string
}

export default function EmailThreadPageClient({
    initialThreads,
    initialMessages,
    initialSelectedThread,
    opportunityId
}: EmailThreadPageClientProps) {
    const [threads, setThreads] = useState<EmailThread[]>(initialThreads)
    const [selectedThread, setSelectedThread] = useState<EmailThread | null>(initialSelectedThread)
    const [messages, setMessages] = useState<EmailMessage[]>(initialMessages)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const fetchThreads = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from(TableName.EMAIL_THREADS)
                .select()
                .eq('opportunity_id', opportunityId)
                .order('last_message_at', { ascending: false })

            if (error) throw error

            setThreads(data)
            if (data.length > 0 && !selectedThread) {
                setSelectedThread(data[0])
            }
        } catch (error) {
            console.error('Error fetching threads:', error)
            toast({
                title: 'Error',
                description: 'Failed to load email threads.',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }, [opportunityId, selectedThread, toast, supabase])

    const fetchMessages = useCallback(async (threadId: string) => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from(TableName.EMAIL_MESSAGES)
                .select()
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true })

            if (error) throw error

            setMessages(data)
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast({
                title: 'Error',
                description: 'Failed to load messages.',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast, supabase])

    // Set up real-time subscriptions
    useEffect(() => {
        let threadsSubscription: RealtimeChannel
        let messagesSubscription: RealtimeChannel

        const setupSubscriptions = async () => {
            // Subscribe to thread updates
            threadsSubscription = supabase
                .channel('email_threads')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: TableName.EMAIL_THREADS,
                        filter: `opportunity_id=eq.${opportunityId}`
                    },
                    async (payload) => {
                        console.log('Thread change received:', payload)
                        // Refresh threads to get the latest data
                        await fetchThreads()
                    }
                )
                .subscribe()

            // Subscribe to message updates for the selected thread
            if (selectedThread) {
                messagesSubscription = supabase
                    .channel('email_messages')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: TableName.EMAIL_MESSAGES,
                            filter: `thread_id=eq.${selectedThread.id}`
                        },
                        async (payload) => {
                            console.log('Message change received:', payload)
                            // Refresh messages to get the latest data
                            await fetchMessages(selectedThread.id)
                        }
                    )
                    .subscribe()
            }
        }

        setupSubscriptions()

        // Cleanup subscriptions on unmount or when dependencies change
        return () => {
            if (threadsSubscription) {
                supabase.removeChannel(threadsSubscription)
            }
            if (messagesSubscription) {
                supabase.removeChannel(messagesSubscription)
            }
        }
    }, [opportunityId, selectedThread?.id, supabase, fetchThreads, fetchMessages])

    useEffect(() => {
        fetchThreads()
    }, [fetchThreads])

    useEffect(() => {
        if (selectedThread) {
            fetchMessages(selectedThread.id)
        }
    }, [selectedThread, fetchMessages])

    const handleSendMessage = async (message: string) => {
        if (!selectedThread) return

        try {
            const response = await fetch('/api/messages/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunityId,
                    threadId: selectedThread.id,
                    message
                })
            })

            if (!response.ok) throw new Error('Failed to send message')

            // Refresh messages
            await fetchMessages(selectedThread.id)
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }

    const handleUpdateStatus = async (status: EmailThread['status']) => {
        if (!selectedThread) return

        try {
            const { error } = await supabase
                .from(TableName.EMAIL_THREADS)
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', selectedThread.id)

            if (error) throw error

            // Update local state
            setThreads(threads.map(thread =>
                thread.id === selectedThread.id
                    ? { ...thread, status }
                    : thread
            ))
            setSelectedThread({ ...selectedThread, status })
        } catch (error) {
            console.error('Error updating status:', error)
            throw error
        }
    }

    return (
        <div className="container mx-auto py-6">
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                    <EmailThreadList
                        threads={threads}
                        selectedThread={selectedThread}
                        onSelectThread={setSelectedThread}
                        isLoading={isLoading}
                    />
                </div>
                <div className="col-span-8">
                    {selectedThread ? (
                        <EmailThreadDetail
                            thread={selectedThread}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onUpdateStatus={handleUpdateStatus}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-muted-foreground">
                            Select a thread to view messages
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 