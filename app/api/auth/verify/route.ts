import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { parseSIWFMessage, verifySIWFSignature } from "@/lib/siwf"
import { generateNonce } from "@/lib/nonce"

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json()

    if (!message || !signature) {
      return NextResponse.json({ error: "Missing message or signature" }, { status: 400 })
    }

    // Parse the SIWF message
    const parsedMessage = parseSIWFMessage(message)

    // Verify the signature
    const verificationResult = await verifySIWFSignature(message, signature)

    if (!verificationResult.verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Create a Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Extract user data from verification result
    const { fid, username, displayName, pfpUrl } = verificationResult

    // Check if user exists in the database
    const { data: existingUser } = await supabase.from("users").select("*").eq("fid", fid).single()

    if (existingUser) {
      // Update existing user
      await supabase
        .from("users")
        .update({
          username,
          display_name: displayName,
          pfp_url: pfpUrl,
          last_login: new Date().toISOString(),
        })
        .eq("fid", fid)
    } else {
      // Create new user
      await supabase.from("users").insert({
        fid,
        username,
        display_name: displayName,
        pfp_url: pfpUrl,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
    }

    // Create a custom session using Supabase's custom claims
    const { data: session, error } = await supabase.auth.signInWithFarcaster({
      fid,
      message,
      signature,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Generate a new nonce for future authentication requests
    const newNonce = generateNonce()

    return NextResponse.json({
      success: true,
      user: {
        fid,
        username,
        displayName,
        pfpUrl,
      },
      nonce: newNonce,
    })
  } catch (error) {
    console.error("Error in auth verification:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
