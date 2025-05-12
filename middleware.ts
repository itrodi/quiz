import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

// Protected routes that require authentication
const protectedRoutes = ["/profile", "/leaderboard", "/create", "/quiz/create", "/challenges"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Create supabase client
  const { supabase } = createClient(request)

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If the user is not authenticated and trying to access a protected route,
  // redirect to the login page
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url)
    // Add the original URL as a query parameter so we can redirect after login
    loginUrl.searchParams.set("returnUrl", encodeURIComponent(request.url))
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Specify the routes the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
}
