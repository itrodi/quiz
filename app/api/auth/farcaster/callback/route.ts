import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // This is a simplified mock endpoint that doesn't require environment variables
  return NextResponse.json({
    success: true,
    message: "Authentication is currently disabled",
  })
}
