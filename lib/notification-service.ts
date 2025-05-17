import { createClient } from "@/lib/supabase/server"
import { sendNotification } from "@/lib/farcaster-sdk"

export async function sendQuizCompletionNotification(
  userId: string,
  quizId: string,
  quizTitle: string,
  score: number,
  totalQuestions: number,
) {
  const supabase = createClient()

  // Get the notification token for this user
  const { data: tokens } = await supabase
    .from("notification_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)

  if (!tokens || tokens.length === 0) {
    return null
  }

  // For each token, send a notification
  const results = await Promise.all(
    tokens.map(async (tokenData) => {
      const { token, url } = tokenData
      const percentage = Math.round((score / totalQuestions) * 100)

      return sendNotification(
        token,
        url,
        `quiz-completion-${quizId}-${userId}`,
        "Quiz Completed!",
        `You scored ${score}/${totalQuestions} (${percentage}%) on ${quizTitle}`,
        `${process.env.NEXT_PUBLIC_APP_URL}/quiz/${quizId}/results`,
      )
    }),
  )

  return results
}

export async function sendChallengeNotification(
  userId: string,
  challengeId: string,
  challengerName: string,
  quizTitle: string,
) {
  const supabase = createClient()

  // Get the notification token for this user
  const { data: tokens } = await supabase
    .from("notification_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)

  if (!tokens || tokens.length === 0) {
    return null
  }

  // For each token, send a notification
  const results = await Promise.all(
    tokens.map(async (tokenData) => {
      const { token, url } = tokenData

      return sendNotification(
        token,
        url,
        `challenge-received-${challengeId}`,
        "New Quiz Challenge!",
        `${challengerName} has challenged you to beat their score on ${quizTitle}`,
        `${process.env.NEXT_PUBLIC_APP_URL}/challenges`,
      )
    }),
  )

  return results
}
