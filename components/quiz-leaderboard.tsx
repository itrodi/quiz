"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-kit-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trophy, Medal } from "lucide-react"

interface QuizLeaderboardProps {
  quizId: string
  isOpen: boolean
  onClose: () => void
}

export function QuizLeaderboard({ quizId, isOpen, onClose }: QuizLeaderboardProps) {
  const [scores, setScores] = useState<any[]>([])
  const [userScore, setUserScore] = useState<any>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile, isAuthenticated } = useAuth()
  const supabase = createClient()

  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds) return "--:--"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboardData()
    }
  }, [isOpen, quizId])

  const fetchLeaderboardData = async () => {
    if (!quizId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch top 50 scores for this quiz
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("user_scores")
        .select(`
          id,
          user_id,
          score,
          max_score,
          percentage,
          time_taken,
          completed_at,
          profiles(id, username, display_name, avatar_url)
        `)
        .eq("quiz_id", quizId)
        .order("percentage", { ascending: false })
        .order("time_taken", { ascending: true }) // Tiebreaker: faster completion time ranks higher
        .limit(50)

      if (leaderboardError) throw leaderboardError

      setScores(leaderboardData || [])

      // If user is logged in, fetch their score
      if (isAuthenticated && profile?.id) {
        console.log("Fetching user score for profile ID:", profile.id)

        const { data: userScoreData, error: userScoreError } = await supabase
          .from("user_scores")
          .select(`
            id,
            user_id,
            score,
            max_score,
            percentage,
            time_taken,
            completed_at
          `)
          .eq("quiz_id", quizId)
          .eq("user_id", profile.id)
          .order("percentage", { ascending: false })
          .limit(1)

        if (userScoreError) {
          console.error("Error fetching user score:", userScoreError)
        } else {
          console.log("User score data:", userScoreData)

          if (userScoreData && userScoreData.length > 0) {
            const bestScore = userScoreData[0]
            setUserScore(bestScore)

            // Calculate user's rank
            const { count, error: rankError } = await supabase
              .from("user_scores")
              .select("*", { count: "exact", head: true })
              .eq("quiz_id", quizId)
              .or(
                `percentage.gt.${bestScore.percentage}, and(percentage.eq.${bestScore.percentage}, time_taken.lt.${bestScore.time_taken})`,
              )

            if (rankError) {
              console.error("Error calculating rank:", rankError)
            } else {
              console.log("User rank calculation result:", count)
              setUserRank(count !== null ? count + 1 : null)
            }
          } else {
            console.log("No user score found")
            setUserScore(null)
            setUserRank(null)
          }
        }
      } else {
        console.log("User not authenticated or no profile ID")
        setUserScore(null)
        setUserRank(null)
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error)
      setError("Failed to load leaderboard data")
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quiz Leaderboard</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-4">
            <TabsTrigger value="all">All Players</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* User's score */}
            {userScore && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Your Score</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold">
                      {userRank !== null ? `#${userRank}` : "?"}
                    </div>
                    <div>
                      <div className="font-medium">You</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(userScore.time_taken)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">{userScore.percentage}%</div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-400">{error}</div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No scores recorded for this quiz yet.</div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      score.user_id === profile?.id ? "bg-slate-700/70 border border-purple-500/30" : "bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8">
                        <div className="bg-slate-600 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index < 3 ? getMedalIcon(index) : index + 1}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={score.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {score.profiles?.display_name?.charAt(0) || score.profiles?.username?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {score.profiles?.display_name || score.profiles?.username || "Anonymous"}
                            {score.user_id === profile?.id && " (You)"}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(score.time_taken)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="font-bold">{score.percentage}%</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
