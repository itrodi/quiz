import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if the request is for a protected route
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/quiz/") ||
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/social") ||
      req.nextUrl.pathname.startsWith("/create")

    // API routes should not be protected by this middleware
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/")

    // If accessing a protected route without being logged in, redirect to login
    if (isProtectedRoute && !session && !isApiRoute) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of an error, just continue to the page
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/quiz/:path*", "/profile/:path*", "/social/:path*", "/create/:path*", "/api/leaderboard/:path*"],
}
