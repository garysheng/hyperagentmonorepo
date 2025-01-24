'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Celebrity ID for development
const CELEBRITY_ID = '0ca0f921-7ccd-4975-9afb-3bed98367403'

export default function ContactDevPage() {
  useEffect(() => {
    // Clean up any existing widget instances
    const existingScript = document.querySelector('script[src="/widget-dev/v1.js"]')
    const existingStyles = document.querySelector('link[href="/widget-dev/styles.css"]')
    const existingBubble = document.querySelector('.hyperagent-bubble')
    const existingWindow = document.querySelector('.hyperagent-chat-window')

    if (existingScript) existingScript.remove()
    if (existingStyles) existingStyles.remove()
    if (existingBubble) existingBubble.remove()
    if (existingWindow) existingWindow.remove()

    // Load development version of widget
    const script = document.createElement('script')
    script.src = '/widget-dev/v1.js'
    script.setAttribute('data-celebrity-id', CELEBRITY_ID)
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)

    // Cleanup on unmount
    return () => {
      script.remove()
      const styles = document.querySelector('link[href="/widget-dev/styles.css"]')
      const bubble = document.querySelector('.hyperagent-bubble')
      const window = document.querySelector('.hyperagent-chat-window')
      
      if (styles) styles.remove()
      if (bubble) bubble.remove()
      if (window) window.remove()
    }
  }, [])

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-4xl font-bold">Contact Us (Development)</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About HyperAgent</CardTitle>
            <CardDescription>
              We\'re building the future of AI-powered customer service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our mission is to help businesses provide exceptional customer service through intelligent automation and human-like interactions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have questions? We\'re here to help!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Click the chat bubble in the bottom right corner to start a conversation with our development version of the widget.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 