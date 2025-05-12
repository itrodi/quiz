import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { verifyFarcasterSignature } from "@/lib/farcaster"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const requestData = await request.json()

    // Extract the Farcaster signature and message from the request
    const { signature, message, fid, username, displayName, pfpUrl } = requestData

    if (!signature || !message || !fid) {
      return NextResponse.json({ error: "Missing required authentication parameters" }, { status: 400 })
    }

    // Verify the Farcaster signature
    const isValid = await verifyFarcasterSignature(message, signature, fid)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Farcaster signature" }, { status: 401 })
    }

    // Generate a custom JWT token using Supabase
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      // For Supabase, we need to use email/password or custom claims
      // Here we're using a deterministic email based on FID
      email: `farcaster-${fid}@braincast.app`,
      password: process.env.SUPABASE_FARCASTER_SECRET || "default-secret-change-me",
    })

    if (error) {
      // If user doesn't exist, create a new account
      if (error.status === 400) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `farcaster-${fid}@braincast.app`,
          password: process.env.SUPABASE_FARCASTER_SECRET || "default-secret-change-me",
          options: {
            data: {
              fid,
              username,
              display_name: displayName,
              avatar_url: pfpUrl,
              provider: "farcaster",
            },
          },
        })

        if (signUpError) {
          return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
        }

        // Create a profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: signUpData.user?.id,
          username,
          display_name: displayName,
          avatar_url: pfpUrl,
          total_score: 0,
          quizzes_taken: 0,
          quizzes_created: 0,
        })

        if (profileError) {
          console.error("Failed to create profile:", profileError)
        }

        return NextResponse.json({
          user: signUpData.user,
          session: signUpData.session,
        })
      }

      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Update user metadata if needed
    if (user) {
      await supabase.auth.updateUser({
        data: {
          fid,
          username,
          display_name: displayName,
          avatar_url: pfpUrl,
          provider: "farcaster",
        },
      })
    }

    return NextResponse.json({ user, session })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
