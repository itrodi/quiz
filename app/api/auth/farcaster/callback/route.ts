import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { searchParams } = new URL(request.url)

    // Get Farcaster data from query params
    const fid = searchParams.get("fid")
    const username = searchParams.get("username")
    const displayName = searchParams.get("display_name")
    const pfpUrl = searchParams.get("pfp_url")

    // Check if we have the required data
    if (!fid || !username) {
      return NextResponse.json({ error: "Missing required Farcaster data" }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase.from("profiles").select("*").eq("fid", fid).single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error checking for existing user:", userError)
    }

    // Create or update user
    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            fid: fid,
            username: username,
            display_name: displayName || username,
            avatar_url: pfpUrl || "",
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }
    } else {
      // Update existing user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: username,
          display_name: displayName || username,
          avatar_url: pfpUrl || "",
        })
        .eq("fid", fid)

      if (updateError) {
        console.error("Error updating user:", updateError)
      }
    }

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error in Farcaster callback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
