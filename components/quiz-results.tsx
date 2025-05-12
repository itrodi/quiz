"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { shareToCast } from "@/lib/farcaster"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"

type QuizResultsProps = {
  score: number
  totalQuestions: number
  timeTaken: number
  quizId: string
  quizTitle: string
}

export function QuizResults({ score, totalQuestions, timeTaken, quizId, quizTitle }: QuizResultsProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const percentage = Math.round((score / totalQuestions) * 100)
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  // Trigger confetti for good scores
  useEffect(() => {
    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [percentage])

  // Fetch leaderboard position
  useEffect(() => {
    if (user) {
      fetchLeaderboardPosition()
    }
  }, [user])

  const fetchLeaderboardPosition = async () => {
    try {
      const { data: scores } = await supabase
        .from("user_scores")
        .select("user_id, score")
        .eq("quiz_id", quizId)
        .order("score", { ascending: false })

      if (scores && user) {
        const position = scores.findIndex((s) => s.user_id === user.id) + 1
        setLeaderboardPosition(position)
      }
    } catch (error) {
      console.error("Error fetching leaderboard position:", error)
    }
  }

  const handleShareResult = async () => {
    setIsSharing(true)
    try {
      const shareText = `I scored ${score}/${totalQuestions} (${percentage}%) on the "${quizTitle}" quiz on BrainCast! Can you beat my score?`
      const shareUrl = `${window.location.origin}/quiz/${quizId}`

      await shareToCast(shareText, shareUrl)
    } catch (error) {
      console.error("Error sharing result:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handlePlayAgain = () => {
    router.refresh()
  }

  const handleExploreMore = () => {
    router.push("/explore")
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-gray-400">
            You completed the quiz in {minutes > 0 ? `${minutes}m ` : ""}
            {seconds}s
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={percentage >= 70 ? "#22c55e" : percentage >= 40 ? "#eab308" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={`${percentage * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
          </div>

          <div className="text-xl font-semibold mb-2">
            {score} / {totalQuestions} correct
          </div>

          {leaderboardPosition && (
            <div className="text-sm text-gray-400 mb-4">Your position on the leaderboard: #{leaderboardPosition}</div>
          )}

          <div className="text-center mb-4">
            {percentage >= 80 ? (
              <p className="text-green-400">Excellent! You're a quiz master!</p>
            ) : percentage >= 60 ? (
              <p className="text-yellow-400">Good job! Keep practicing!</p>
            ) : (
              <p className="text-red-400">Nice try! You'll do better next time.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handlePlayAgain} className="flex-1">
            Play Again
          </Button>
          <Button onClick={handleShareResult} variant="outline" className="flex-1" disabled={isSharing}>
            {isSharing ? "Sharing..." : "Share Result"}
          </Button>
          <Button onClick={handleExploreMore} variant="outline" className="flex-1">
            Explore More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
