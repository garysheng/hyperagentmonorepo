import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define routes that don't require authentication or celebrity association
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/confirm', '/contact']
const CREATE_CELEBRITY_ROUTE = '/create-celebrity'
const SET_GOALS_ROUTE = '/set-goals'
const AUTH_ROUTES = ['/auth', '/api/auth']
const STATIC_ROUTES = ['/_next', '/favicon.ico', '/widget']

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/opportunities',
  '/api/goals',
  '/api/dev/twitter/dms',
  '/api/dev/manualdm'
]

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware running for path:', request.nextUrl.pathname)

  // Skip middleware for static routes and widget files
  if (STATIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route)) || 
      request.nextUrl.pathname.includes('/widget/')) {
    console.log('⏩ Skipping middleware for static route or widget')
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  const isApiRoute = pathname.startsWith('/api/')
  const isProtectedApiRoute = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))

  console.log('📍 Route checks:', {
    isPublicRoute,
    isAuthRoute,
    isApiRoute,
    isProtectedApiRoute,
    pathname
  })

  // Allow public routes, auth routes, and non-protected API routes without any checks
  if (isPublicRoute || isAuthRoute || (isApiRoute && !isProtectedApiRoute)) {
    console.log('✅ Allowing public/auth/api route access')
    return NextResponse.next()
  }

  // For protected routes, create a new response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({ name, value, ...options })
            )
          },
        },
      }
    )

    // Refresh session, if it exists
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('👤 Auth check result:', {
      hasUser: !!user,
      error: userError?.message
    })

    // If no user or error, redirect to login
    if (!user || userError) {
      console.log('❌ No authenticated user - redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For all routes except create-celebrity, check if user has a celebrity_id
    if (pathname !== CREATE_CELEBRITY_ROUTE) {
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('celebrity_id')
        .eq('id', user.id)
        .single()

      console.log('🎭 Celebrity check result:', {
        hasCelebrityId: !!userData?.celebrity_id,
        error: dbError?.message
      })

      if (!userData?.celebrity_id) {
        console.log('⚠️ No celebrity_id - redirecting to create-celebrity')
        return NextResponse.redirect(new URL('/create-celebrity', request.url))
      }

      // For all routes except set-goals, check if celebrity has any goals
      if (pathname !== SET_GOALS_ROUTE) {
        const { count, error: goalsError } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('celebrity_id', userData.celebrity_id)

        console.log('🎯 Goals check result:', {
          hasGoals: count && count > 0,
          error: goalsError?.message
        })

        if (!count || count === 0) {
          console.log('⚠️ No goals found - redirecting to set-goals')
          return NextResponse.redirect(new URL('/set-goals', request.url))
        }
      }
    }

    // User is authenticated and has required data - allow access
    console.log('✅ All checks passed - allowing access')

    // Add CORS headers for widget API endpoints
    if (request.nextUrl.pathname.startsWith('/api/widget')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    }

    // Add CSP header
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.hyperagent.so;
      style-src 'self' 'unsafe-inline' https://widget.hyperagent.so;
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://widget.hyperagent.so https://hyperagent.so https://*.hyperagent.so;
      frame-src 'self';
      frame-ancestors 'self';
    `.replace(/\s+/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)

    return response

  } catch (error) {
    console.error('🔥 Auth error:', error)
    // On error, redirect to login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    // Protected app routes
    '/dashboard/:path*',
    '/settings/:path*',
    '/outbound/:path*',
    '/create-celebrity',
    '/set-goals',
    
    // Protected API routes
    '/api/opportunities/:path*',
    '/api/goals/:path*',
    '/api/dev/:path*',
  ]
} 