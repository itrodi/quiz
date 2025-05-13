import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/profile", "/create", "/social"]

// Define admin routes that require admin authentication
const adminRoutes = ["/admin", "/admin/dashboard", "/admin/quizzes", "/admin/achievements"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for admin routes
  if (pathname.startsWith("/admin") && !pathname.includes("/admin/login")) {
    // Admin authentication logic is handled by the admin middleware
    return
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isProtectedRoute) {
    // Check for authentication cookie
    const authCookie = request.cookies.get("fc_auth")

    if (!authCookie) {
      // Redirect to login if not authenticated
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
