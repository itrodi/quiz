import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Allow access to all routes without authentication
  return NextResponse.next()
}

// Keep the matcher to ensure middleware runs on the right routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
