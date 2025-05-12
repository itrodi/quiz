"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserChallengesProps {
  userId: string
}

export function UserChallenges({ userId }: UserChallengesProps) {
  const [activeChallenges, setActiveChallenges] = useState<any[]>([])
  const [sentChallenges, setSentChallenges] = useState<any[]>([])
  const [historyChallenges, setHistoryChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchChallenges() {
      if (!userId) return

      try {
        // Fetch active challenges (where user is recipient and status is pending)
        const { data: active, error: activeError } = await supabase
          .from("challenges")
          .select(`
            *,
            challenger:profiles!challenger_id(username, display_name, avatar_url),
            quiz:quizzes(id, title, emoji)
          `)
          .eq("recipient_id", userId)
          .eq("status", "pending")

        if (activeError) throw activeError

        // Fetch sent challenges (where user is challenger)
        const { data: sent, error: sentError } = await supabase
          .from("challenges")
          .select(`
            *,
            recipient:profiles!recipient_id(username, display_name, avatar_url),
            quiz:quizzes(id, title, emoji)
          `)
          .eq("challenger_id", userId)

        if (sentError) throw sentError

        // Fetch history (completed challenges)
        const { data: history, error: historyError } = await supabase
          .from("challenges")
          .select(`
            *,
            challenger:profiles!challenger_id(username, display_name, avatar_url),
            recipient:profiles!recipient_id(username, display_name, avatar_url),
            quiz:quizzes(id, title, emoji)
          `)
          .eq("status", "completed")
          .or(`challenger_id.eq.${userId},recipient_id.eq.${userId}`)

        if (historyError) throw historyError

        // Format the data
        const formattedActive = active.map((challenge: any) => ({
          id: challenge.id,
          challenger: {
            username: challenge.challenger.username,
            displayName: challenge.challenger.display_name,
            pfpUrl: challenge.challenger.avatar_url || "/placeholder.svg?height=40&width=40",
          },
          quizId: challenge.quiz_id,
          quizTitle: challenge.quiz.title,
          challengerScore: challenge.challenger_score,
          questions: 0, // We don't have this info in the database
          timeLeft: getTimeLeft(challenge.expires_at),
        }))

        const formattedSent = sent.map((challenge: any) => ({
          id: challenge.id,
          recipient: {
            username: challenge.recipient.username,
            displayName: challenge.recipient.display_name,
            pfpUrl: challenge.recipient.avatar_url || "/placeholder.svg?height=40&width=40",
          },
          quizTitle: challenge.quiz.title,
          yourScore: challenge.challenger_score,
          sentDate: new Date(challenge.created_at).toLocaleDateString(),
          status: challenge.status,
        }))

        const formattedHistory = history.map((challenge: any) => {
          const isChallenger = challenge.challenger_id === userId
          const opponent = isChallenger ? challenge.recipient : challenge.challenger
          const yourScore = isChallenger ? challenge.challenger_score : challenge.recipient_score
          const opponentScore = isChallenger ? challenge.recipient_score : challenge.challenger_score

          let result = "Tied"
          if (yourScore > opponentScore) result = "Won"
          else if (yourScore < opponentScore) result = "Lost"

          return {
            id: challenge.id,
            opponent: {
              username: opponent.username,
              displayName: opponent.display_name,
              pfpUrl: opponent.avatar_url || "/placeholder.svg?height=40&width=40",
            },
            quizTitle: challenge.quiz.title,
            yourScore,
            opponentScore,
            date: new Date(challenge.updated_at).toLocaleDateString(),
            result,
          }
        })

        setActiveChallenges(formattedActive)
        setSentChallenges(formattedSent)
        setHistoryChallenges(formattedHistory)
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [userId, supabase])

  function getTimeLeft(expiresAt: string) {
    if (!expiresAt) return "Unknown"

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()

    if (diffMs <= 0) return "Expired"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) return `${diffDays} days left`
    return `${diffHours} hours left`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-3 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                <div>
                  <div className="h-4 bg-slate-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                </div>
              </div>
              <div className="h-5 bg-slate-700 rounded w-20"></div>
            </div>
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="active">
      <TabsList className="grid grid-cols-3 mb-4 bg-slate-800">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        <div className="space-y-3">
          {activeChallenges.length > 0 ? (
            activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={challenge.challenger.pfpUrl || "/placeholder.svg"}
                        alt={challenge.challenger.displayName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{challenge.challenger.displayName}</div>
                        <div className="text-xs text-slate-400">@{challenge.challenger.username}</div>
                      </div>
                    </div>
                    <Badge>{challenge.timeLeft}</Badge>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-bold text-sm">{challenge.quizTitle}</h3>
                    <div className="flex justify-between text-xs text-slate-500">
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-3 w-3" />
                        <span>Their score: {challenge.challengerScore}%</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{challenge.questions || "?"} questions</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild size="sm" className="w-full">
                    <Link href={`/quiz/${challenge.quizId}?challenge=${challenge.id}`}>Accept Challenge</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active challenges</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="sent">
        <div className="space-y-3">
          {sentChallenges.length > 0 ? (
            sentChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={challenge.recipient.pfpUrl || "/placeholder.svg"}
                        alt={challenge.recipient.displayName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{challenge.recipient.displayName}</div>
                        <div className="text-xs text-slate-400">@{challenge.recipient.username}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{challenge.status}</Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm">{challenge.quizTitle}</h3>
                    <div className="flex justify-between text-xs text-slate-500">
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-3 w-3" />
                        <span>Your score: {challenge.yourScore}%</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Sent {challenge.sentDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">You haven't sent any challenges yet</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="history">
        <div className="space-y-3">
          {historyChallenges.length > 0 ? (
            historyChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={challenge.opponent.pfpUrl || "/placeholder.svg"}
                        alt={challenge.opponent.displayName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{challenge.opponent.displayName}</div>
                        <div className="text-xs text-slate-400">@{challenge.opponent.username}</div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        challenge.result === "Won" ? "default" : challenge.result === "Lost" ? "destructive" : "outline"
                      }
                    >
                      {challenge.result}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm">{challenge.quizTitle}</h3>
                    <div className="flex justify-between text-xs text-slate-500">
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-3 w-3" />
                        <span>
                          You: {challenge.yourScore}% | Them: {challenge.opponentScore}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{challenge.date}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No challenge history yet</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
