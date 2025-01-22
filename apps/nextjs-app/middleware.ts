import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define routes that don't require authentication or celebrity association
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/confirm']
const CREATE_CELEBRITY_ROUTE = '/create-celebrity'
const AUTH_ROUTES = ['/auth', '/api/auth']
const STATIC_ROUTES = ['/_next', '/favicon.ico']

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware running for path:', request.nextUrl.pathname)

  // Skip middleware for static routes
  if (STATIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
    console.log('⏩ Skipping middleware for static route')
    return NextResponse.next()
  }

  // Check route type
  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  console.log('📍 Route checks:', {
    isPublicRoute,
    isAuthRoute,
    pathname
  })

  // Allow public and auth routes without any checks
  if (isPublicRoute || isAuthRoute) {
    console.log('✅ Allowing public/auth route access')
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
    }

    // User is authenticated and has required data - allow access
    console.log('✅ All checks passed - allowing access')
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
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
} 