'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'
import { ArrowRight, MessageSquare, Sparkles, Bot, Star, Video, Heart, Store } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

const EXAMPLE_MESSAGES = [
  {
    id: 1,
    handle: '@charity_org',
    content: 'We\'ve secured matching donations up to $10M to provide laptops and internet access to 10,000 underprivileged students. Your involvement could double our impact. Ready to launch within 2 weeks.',
    relevance: 4.8,
    type: 'Philanthropy'
  },
  {
    id: 2,
    handle: '@production_studio',
    content: 'Groundbreaking challenge concept: 10 contestants live in a fully self-sustaining biodome for 100 days. $2M prize pool, Netflix already interested in distribution. Full production crew and infrastructure ready.',
    relevance: 4.5,
    type: 'Content Creation'
  },
  {
    id: 3,
    handle: 'partnerships@major-retail.com',
    content: 'Exclusive opportunity to launch Feastables in our 2,000+ premium stores nationwide. Committed to $5M marketing budget and prime shelf placement. Our Gen-Z customer base perfectly matches your demographic.',
    relevance: 4.2,
    type: 'Business Ventures'
  },
  {
    id: 4,
    handle: '@event_organizer',
    content: 'Planning the world\'s largest gaming tournament: $5M prize pool, 100k live attendees, global streaming rights. Looking for you to be the face of the event with creative control.',
    relevance: 3.7,
    type: 'Content Creation'
  },
  {
    id: 5,
    handle: '@tech_startup',
    content: 'We\'ve developed an app that gamifies charitable giving with real-time impact tracking. Already raised $2M in seed funding and have 50k waitlist signups.',
    relevance: 2.6,
    type: 'Philanthropy'
  },
  {
    id: 6,
    handle: '@crypto_scam',
    content: 'Hey MrBeast! Want to promote our new crypto token? $500k upfront payment! To the moon! 🚀',
    relevance: 0.2,
    type: 'Spam'
  }
]

const EXAMPLE_GOALS = [
  {
    id: 1,
    title: 'Philanthropy',
    description: 'Looking for impactful charity collaborations and giving opportunities',
    icon: 'Heart'
  },
  {
    id: 2,
    title: 'Content Creation',
    description: 'Seeking unique video ideas and viral challenges with high production value',
    icon: 'Video'
  },
  {
    id: 3,
    title: 'Business Ventures',
    description: 'Interested in food industry partnerships and sustainable business opportunities',
    icon: 'Store'
  }
]

function getRelevanceColor(score: number): string {
  if (score >= 4.5) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (score >= 4.0) return 'bg-green-500/10 text-green-500 border-green-500/20'
  if (score >= 3.5) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  if (score >= 3.0) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  return 'bg-red-500/10 text-red-500 border-red-500/20'
}

function ExampleMessage({ message, index }: { message: typeof EXAMPLE_MESSAGES[0], index: number }) {
  return (
    <div 
      className={cn(
        'p-4 rounded-lg border animate-slide-up opacity-0',
        getRelevanceColor(message.relevance)
      )}
      style={{ 
        animationDelay: `${index * 0.2}s`,
        animationIterationCount: 'infinite',
        animationDuration: '10s'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium">{message.handle}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>{message.relevance.toFixed(1)}/5.0</span>
        </div>
      </div>
      <p className="text-sm mb-2">{message.content}</p>
      <Badge variant="outline" className="text-xs">
        {message.type}
      </Badge>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  if (loading) {
    return null
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue managing your DMs with AI-powered assistance.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
            <Link href="/dashboard" className="flex items-center justify-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/30">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2 ml-4">
            <Logo size={24} />
            <span className="font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">HyperAgent</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
            <Link href="/login" className="flex items-center gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mt-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Logo size={48} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                HyperAgent
              </h1>
            </div>
            <p className="text-xl mb-12 text-muted-foreground">
              AI-powered DM management for celebrities and public figures.<br />
              Never miss an important opportunity again.
            </p>
          </div>

          {/* Step 1: Create Account */}
          <div className="max-w-4xl mx-auto space-y-4 text-center mb-8">
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 px-3 py-1 text-sm text-primary">
              Step 1
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Create an Account for Your Celebrity
            </h2>
            <p className="text-muted-foreground">Example: How Mr Beast's team manages opportunities</p>
          </div>

          {/* Sign Up Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-card/50 backdrop-blur-sm p-6 hover:bg-card/60 transition-colors">
              <Logo size={32} className="mb-2" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Celebrity Admin
              </h2>
              <p className="text-muted-foreground text-center">
                Create a new account to manage your own Twitter DMs and build your team.
              </p>
              <Button asChild size="lg" className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                <Link href="/signup" className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative flex flex-col items-center space-y-4 rounded-lg border bg-card/50 backdrop-blur-sm p-6 hover:bg-card/60 transition-colors">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Team Member
              </h2>
              <p className="text-muted-foreground text-center">
                Join an existing celebrity's team using an invite code from your admin.
              </p>
              <Button asChild variant="outline" size="lg" className="w-full mt-4 border-primary/20 hover:bg-primary/10">
                <Link href="/join-team" className="flex items-center justify-center">
                  Join Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Step 2: Set Goals */}
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 px-3 py-1 text-sm text-primary">
              Step 2
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Set Your Celebrity's Goals
            </h2>
            <p className="text-muted-foreground mb-8">Mr Beast's example goals for opportunity filtering</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLE_GOALS.map((goal) => (
                <div key={goal.id} className="flex flex-col items-center space-y-3 p-6 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
                  <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20">
                    {goal.icon === 'Heart' && <Heart className="w-6 h-6 text-primary" />}
                    {goal.icon === 'Video' && <Video className="w-6 h-6 text-primary" />}
                    {goal.icon === 'Store' && <Store className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example Messages */}
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 px-3 py-1 text-sm text-primary">
              Step 3
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Let AI Filter Your Opportunities
            </h2>
            <p className="text-muted-foreground mb-8">Example messages ranked by relevance to Mr Beast's goals</p>
          </div>

          {/* Step 3: See Opportunities */}
          <div className="w-full bg-gradient-to-b from-background to-muted/20 py-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXAMPLE_MESSAGES.map((message, index) => (
                  <ExampleMessage 
                    key={message.id} 
                    message={message} 
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* For Celebrity Teams */}
          <div className="max-w-4xl mx-auto space-y-4 text-center mt-16">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              HyperAgent Is Built To Save Busy Celebrity Teams Hours Every Day
            </h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li>✨ AI-powered opportunity scoring and prioritization</li>
              <li>🤝 Team collaboration on DM management</li>
              <li>📊 Analytics and insights on engagement</li>
              <li>🔒 Secure and private communication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
