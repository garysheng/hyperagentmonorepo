'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'

export default function ContactPage() {
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script')
    script.src = '/api/widget/v1.js'
    script.dataset.celebrityId = 'hyperagentman'
    script.dataset.primaryColor = '#0F172A'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script)
      const container = document.getElementById('hyperagent-chat-widget')
      if (container) {
        document.body.removeChild(container)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contact HyperAgent</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">About HyperAgent Man</h2>
          <p className="text-muted-foreground mb-4">
            Your friendly neighborhood AI assistant, helping teams manage their communications more effectively.
          </p>
          <div className="space-y-2">
            <h3 className="font-medium">Interested in:</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>AI/ML Solutions</li>
              <li>Automation</li>
              <li>Developer Tools</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground">
            Use the chat widget in the bottom right corner to send us a message. We\'ll get back to you as soon as possible.
          </p>
        </Card>
      </div>
    </div>
  )
} 