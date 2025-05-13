import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// List of routes that require authentication
const protectedRoutes = ["/profile", "/create", "/quiz/create", "/social/profile"]

// List of routes that are public
const publicRoutes = ["/login", "/auth", "/api"]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const { pathname } = url

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If the route requires authentication and the user is not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    url.pathname = "/login"
    url.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access a public route, redirect to home
  if (session && isPublicRoute && pathname !== "/api") {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
