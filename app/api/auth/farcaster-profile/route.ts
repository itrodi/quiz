import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type FarcasterUser = {
  fid: number
  username: string | null
  displayName: string | null
  pfpUrl: string | null
}

export async function POST(request: Request) {
  const supabase = createClient()
  let requestBody: FarcasterUser

  try {
    requestBody = await request.json()
  } catch (error) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }

  const { fid, username, displayName, pfpUrl } = requestBody

  if (!fid) {
    return NextResponse.json({ message: "Farcaster FID is required" }, { status: 400 })
  }

  try {
    // Check if a profile with this FID already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("fid", fid)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116: Row not found
      console.error("Error fetching profile by FID:", fetchError)
      throw fetchError
    }

    let profileData

    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          username: username || existingProfile.username, // Keep existing if new is null
          display_name: displayName || existingProfile.display_name,
          avatar_url: pfpUrl || existingProfile.avatar_url,
          // last_seen_farcaster: new Date().toISOString(), // Optional: track activity
        })
        .eq("fid", fid)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating Farcaster profile:", updateError)
        throw updateError
      }
      profileData = updatedProfile
    } else {
      // Create new profile
      // This assumes your 'profiles' table has an 'fid' column and other relevant columns.
      // It also assumes that a profile can exist without a corresponding auth.users entry,
      // or that you handle linking to an auth.users entry separately if needed.
      // For this example, we're just creating/updating the profile based on FID.

      // Check if a user with a similar username exists to avoid conflicts if username is unique in profiles
      // This logic might need adjustment based on your 'profiles' table constraints

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: crypto.randomUUID(), // Or link to an existing Supabase auth user ID if available
          fid: fid,
          username: username,
          display_name: displayName,
          avatar_url: pfpUrl,
          total_score: 0, // Default values
          quizzes_taken: 0,
          quizzes_created: 0,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error inserting Farcaster profile:", insertError)
        // Handle potential unique constraint violations if username should be unique etc.
        if (insertError.code === "23505") {
          // Unique violation
          return NextResponse.json(
            {
              message: "Profile creation conflict, possibly duplicate username or fid if unique constraint exists.",
              error: insertError.message,
            },
            { status: 409 },
          )
        }
        throw insertError
      }
      profileData = newProfile
    }

    // Map to expected Profile type in frontend if necessary
    const responseProfile = {
      id: profileData.id,
      username: profileData.username,
      displayName: profileData.display_name,
      pfpUrl: profileData.avatar_url,
      totalScore: profileData.total_score,
      quizzesTaken: profileData.quizzes_taken,
      quizzesCreated: profileData.quizzes_created,
    }

    return NextResponse.json(responseProfile, { status: 200 })
  } catch (error: any) {
    console.error("Error in /api/auth/farcaster-profile:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}
