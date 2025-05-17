import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const supabase = createClient()

    // In a production app, you would verify the webhook signature
    // using @farcaster/frame-node's parseWebhookEvent and verifyAppKeyWithNeynar

    // Extract the event type
    const event = data.event

    if (event === "frame_added") {
      // User added the mini app
      const { notificationDetails } = data
      if (notificationDetails) {
        const { token, url } = notificationDetails

        // Get the user's FID from the session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Store the notification token for this user
          await supabase.from("notification_tokens").insert({
            user_id: session.user.id,
            token,
            url,
            enabled: true,
          })
        }
      }
    } else if (event === "frame_removed") {
      // User removed the mini app
      // Mark all notification tokens as invalid for this user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await supabase
          .from("notification_tokens")
          .update({
            enabled: false,
          })
          .eq("user_id", session.user.id)
      }
    } else if (event === "notifications_enabled") {
      // User enabled notifications
      const { notificationDetails } = data
      if (notificationDetails) {
        const { token, url } = notificationDetails

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Store the new notification token
          await supabase.from("notification_tokens").insert({
            user_id: session.user.id,
            token,
            url,
            enabled: true,
          })
        }
      }
    } else if (event === "notifications_disabled") {
      // User disabled notifications
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await supabase
          .from("notification_tokens")
          .update({
            enabled: false,
          })
          .eq("user_id", session.user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
