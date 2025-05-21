import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const challengeId = params.id

  try {
    const { score } = await request.json()

    // Get the user's ID from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user_id = session.user.id

    // Get the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .or(`challenger_id.eq.${user_id},recipient_id.eq.${user_id}`) // User must be either challenger or recipient
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: "Challenge not found or you're not a participant" }, { status: 404 })
    }

    // Determine if the user is the challenger or recipient
    const isChallenger = challenge.challenger_id === user_id

    // Update the appropriate score
    const updateData: any = {}
    if (isChallenger) {
      updateData.challenger_score = score
    } else {
      updateData.recipient_score = score
    }

    // If both scores are now set, mark the challenge as completed
    if (
      (isChallenger && challenge.recipient_score !== null) ||
      (!isChallenger && challenge.challenger_score !== null)
    ) {
      updateData.status = "completed"

      // Determine the winner and award points
      const challengerScore = isChallenger ? score : challenge.challenger_score
      const recipientScore = isChallenger ? challenge.recipient_score : score

      if (challengerScore > recipientScore) {
        // Challenger wins
        await updateUserScore(supabase, challenge.challenger_id, 3)
      } else if (recipientScore > challengerScore) {
        // Recipient wins
        await updateUserScore(supabase, challenge.recipient_id, 3)
      } else {
        // Draw
        await updateUserScore(supabase, challenge.challenger_id, 1)
        await updateUserScore(supabase, challenge.recipient_id, 1)
      }
    }

    // Update the challenge
    const { error: updateError } = await supabase.from("challenges").update(updateData).eq("id", challengeId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, challengeId })
  } catch (error) {
    console.error("Error completing challenge:", error)
    return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 })
  }
}

async function updateUserScore(supabase: any, userId: string, points: number) {
  try {
    await supabase
      .from("profiles")
      .update({
        total_score: supabase.rpc("increment", { x: points }),
      })
      .eq("id", userId)
  } catch (error) {
    console.error("Error updating user score:", error)
  }
}
