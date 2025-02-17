import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getReadWriteClient, refreshTwitterToken } from '@/lib/twitter/client'
import { TableName } from '@/types'
import { ApiResponseError } from 'twitter-api-v2'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { opportunityId, message } = await request.json()

    if (!opportunityId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get opportunity details with celebrity_id
    const { data: opportunity, error: oppError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select(`
        id,
        sender_id,
        twitter_sender_id,
        twitter_dm_conversation_id,
        celebrity_id
      `)
      .eq('id', opportunityId)
      .single()

    console.log('Opportunity lookup:', { opportunity, error: oppError })

    if (oppError || !opportunity) {
      return NextResponse.json(
        { error: 'Could not find opportunity' },
        { status: 404 }
      )
    }

    // Get user_id for the celebrity
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('celebrity_id', opportunity.celebrity_id)
      .single()

    console.log('User lookup:', { user, error: userError, celebrity_id: opportunity.celebrity_id })

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Could not find user for celebrity' },
        { status: 404 }
      )
    }

    // Get Twitter auth for the user
    const { data: twitterAuth, error: authError } = await supabase
      .from(TableName.TWITTER_AUTH)
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single()

    console.log('Twitter auth lookup:', { twitterAuth, error: authError, user_id: user.id })

    if (authError || !twitterAuth?.access_token) {
      return NextResponse.json(
        { error: 'Could not find Twitter authentication' },
        { status: 404 }
      )
    }

    // Send DM using Twitter API
    let client = getReadWriteClient(twitterAuth.access_token)
    
    let dmResponse
    try {
      dmResponse = await client.sendDmToParticipant(
        opportunity.twitter_sender_id,
        { text: message }
      )
    } catch (error) {
      if (error instanceof ApiResponseError) {
        console.error('Twitter API Error Details:', {
          code: error.code,
          message: error.message,
          data: error.data,
          rateLimitInfo: error.rateLimit,
          headers: error.headers
        })

        if (error.code === 401 && twitterAuth.refresh_token) {
          try {
            // Refresh token and update in database
            const newTokens = await refreshTwitterToken(twitterAuth.refresh_token)
            const { error: updateError } = await supabase
              .from('twitter_auth')
              .update(newTokens)
              .eq('user_id', user.id)

            if (updateError) {
              console.error('Error updating tokens:', updateError)
              return NextResponse.json(
                { error: 'Failed to update Twitter tokens' },
                { status: 500 }
              )
            }

            // Retry with new token
            client = getReadWriteClient(newTokens.access_token)
            
            // Retry sending the message
            dmResponse = await client.sendDmToParticipant(
              opportunity.twitter_sender_id,
              { text: message }
            )
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError)
            return NextResponse.json(
              { error: 'Failed to refresh Twitter authentication. Please reconnect your Twitter account.' },
              { status: 403 }
            )
          }
        } else if (error.code === 401) {
          return NextResponse.json(
            { error: 'Twitter authentication expired and no refresh token available. Please reconnect your Twitter account.' },
            { status: 401 }
          )
        } else if (error.code === 403) {
          const errorMessage = error.data?.detail || 'Twitter authentication invalid. Please reconnect your Twitter account.'
          return NextResponse.json(
            { error: errorMessage },
            { status: 403 }
          )
        } else if (error.code === 429) {
          const resetTime = error.rateLimit?.day?.reset
            ? new Date(error.rateLimit.day.reset * 1000).toLocaleString()
            : 'tomorrow'
          
          return NextResponse.json(
            { 
              error: `Twitter DM daily limit reached. Please try again ${resetTime}.`,
              details: {
                limit: error.rateLimit?.day?.limit,
                reset: resetTime
              }
            },
            { status: 429 }
          )
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    if (!dmResponse) {
      throw new Error('Failed to send DM')
    }

    // Update opportunity status
    const { error: updateError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .update({
        status: 'conversation_started',
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        twitter_dm_conversation_id: dmResponse.dm_conversation_id
      })
      .eq('id', opportunityId)

    if (updateError) {
      throw updateError
    }

    // Create message record
    const { error: messageError } = await supabase
      .from(TableName.OPPORTUNITY_MESSAGES)
      .insert({
        opportunity_id: opportunityId,
        content: message,
        platform_message_id: dmResponse.dm_event_id,
        direction: 'outbound',
        created_at: new Date().toISOString()
      })

    if (messageError) {
      throw messageError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Twitter DM:', error)
    if (error instanceof ApiResponseError) {
      return NextResponse.json(
        { 
          error: 'Twitter API error', 
          details: {
            code: error.code,
            message: error.message,
            rateLimit: error.rateLimit
          }
        },
        { status: error.code || 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 