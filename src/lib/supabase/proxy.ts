import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/update-password']

function isPublic(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/')
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, String(value)))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const authenticated = Boolean(data?.claims?.sub)
  const path = request.nextUrl.pathname

  if (!authenticated && !isPublic(path)) {
    const nextUrl = request.nextUrl.clone()
    nextUrl.pathname = '/login'
    nextUrl.searchParams.set('next', path)
    return NextResponse.redirect(nextUrl)
  }

  if (authenticated && ['/login', '/register'].includes(path)) {
    const nextUrl = request.nextUrl.clone()
    nextUrl.pathname = '/dashboard'
    nextUrl.search = ''
    return NextResponse.redirect(nextUrl)
  }

  return response
}
