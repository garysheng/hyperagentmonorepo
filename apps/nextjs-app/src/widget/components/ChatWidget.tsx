/** @jsx h */
import { h, JSX } from 'preact'
import { useState } from 'preact/hooks'

interface ChatWidgetProps {
  celebrityId: string
  theme: {
    primaryColor?: string
  }
}

interface Message {
  type: 'user' | 'system'
  content: string
}

export function ChatWidget({ celebrityId, theme }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: 'Hi! Tell us about your proposal. Please include:\n- Your background\n- Project details\n- Goals and timeline'
    }
  ])
  const [email, setEmail] = useState('')
  const [currentMessage, setCurrentMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentMessage.trim() || isSubmitting) return

    setIsSubmitting(true)
    setMessages(prev => [...prev, { type: 'user', content: currentMessage }])
    setCurrentMessage('')

    try {
      const payload = {
        celebrityId,
        email,
        message: currentMessage
      };
      console.log('Sending request with payload:', payload);
      
      const response = await fetch('/api/widget/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || `Request failed with status ${response.status}`;
        } else {
          // Don't include HTML content in error message
          errorMessage = `Request failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          content: 'Thanks for your message! We\'ll review it and get back to you soon.'
        }
      ])
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          content: error instanceof Error ? error.message : 'Sorry, there was an error sending your message. Please try again.'
        }
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }

  const handleMessageChange = (e: JSX.TargetedEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.currentTarget.value)
  }

  return (
    <div>
      <button 
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: theme.primaryColor,
          transform: 'scaleX(-1)'
        }}
      >
        💬
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat with HyperAgent</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="chat-form">
            <div className={`email-input-container ${email ? 'hidden' : ''}`}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={handleEmailChange}
                required={!email}
              />
            </div>
            <div className="message-input">
              <textarea
                placeholder="Type your message..."
                value={currentMessage}
                onChange={handleMessageChange}
                rows={3}
                required
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !email}
                style={{ 
                  backgroundColor: theme.primaryColor 
                }}
              >
                {isSubmitting ? '...' : '→'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
} 