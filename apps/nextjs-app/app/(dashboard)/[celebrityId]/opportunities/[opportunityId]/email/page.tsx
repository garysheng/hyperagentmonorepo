import { createClient } from '@/lib/supabase/server'
import { TableName } from '@/types'
import EmailThreadPageClient from './email-thread-page-client'

interface EmailThreadPageProps {
    params: Promise<{
        celebrityId: string
        opportunityId: string
    }>
}

export default async function EmailThreadPage({ params }: EmailThreadPageProps) {
    const { opportunityId } = await params
    const supabase = await createClient()

    // Fetch threads on the server
    const { data: threads, error: threadsError } = await supabase
        .from(TableName.EMAIL_THREADS)
        .select()
        .eq('opportunity_id', opportunityId)
        .order('last_message_at', { ascending: false })

    if (threadsError) {
        console.error('Error fetching threads:', threadsError)
        throw new Error('Failed to load email threads.')
    }

    // Fetch messages for the first thread (if any)
    const initialThread = threads[0]
    let messages = []

    if (initialThread) {
        const { data: messagesData, error: messagesError } = await supabase
            .from(TableName.EMAIL_MESSAGES)
            .select()
            .eq('thread_id', initialThread.id)
            .order('created_at', { ascending: true })

        if (messagesError) {
            console.error('Error fetching messages:', messagesError)
            throw new Error('Failed to load messages.')
        }

        messages = messagesData
    }

    return (
        <EmailThreadPageClient
            initialThreads={threads}
            initialMessages={messages}
            initialSelectedThread={initialThread || null}
            opportunityId={opportunityId}
        />
    )
} 