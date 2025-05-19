import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Create a response object
    const res = NextResponse.next()

    // Create a Supabase client
    const supabase = createMiddlewareClient({ req, res })

    // Refresh the session
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

    // Auth routes should not be redirected
    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/signup") ||
      req.nextUrl.pathname.startsWith("/auth")

    // If accessing a protected route without being logged in, redirect to login
    if (isProtectedRoute && !session && !isApiRoute && !isAuthRoute) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing login/signup while logged in, redirect to home
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Add the session to the response
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of an error, just continue to the page
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
