"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function NotificationsDropdown() {
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        // Get friend requests
        const { data: requests } = await supabase
          .from("friends")
          .select(`
            id,
            sender_id,
            status,
            created_at,
            profiles!friends_sender_id_fkey(username, display_name, avatar_url)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        // Get challenge notifications
        const { data: challengeData } = await supabase
          .from("challenges")
          .select(`
            id,
            status,
            challenger_id,
            recipient_id,
            quiz_id,
            challenger_score,
            recipient_score,
            created_at,
            challenger:profiles!challenges_challenger_id_fkey(username, display_name, avatar_url),
            recipient:profiles!challenges_recipient_id_fkey(username, display_name, avatar_url),
            quiz:quizzes(title, emoji)
          `)
          .order("created_at", { ascending: false })
          .limit(10)

        setFriendRequests(requests || [])
        setChallenges(challengeData || [])

        // Calculate unread count
        const totalUnread =
          (requests?.length || 0) +
          (challengeData?.filter((c: any) => c.status === "pending" || c.status === "accepted")?.length || 0)
        setUnreadCount(totalUnread)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscription for new notifications
    const friendsSubscription = supabase
      .channel("friends-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "friends" }, fetchNotifications)
      .subscribe()

    const challengesSubscription = supabase
      .channel("challenges-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, fetchNotifications)
      .subscribe()

    return () => {
      supabase.removeChannel(friendsSubscription)
      supabase.removeChannel(challengesSubscription)
    }
  }, [])

  const handleFriendRequestClick = () => {
    router.push("/social?tab=requests")
  }

  const handleChallengeClick = () => {
    router.push("/profile?tab=challenges")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : (
          <>
            {friendRequests.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Friend Requests</DropdownMenuLabel>
                {friendRequests.slice(0, 3).map((request) => (
                  <DropdownMenuItem key={request.id} onClick={handleFriendRequestClick} className="cursor-pointer">
                    <div className="flex items-start gap-2 py-1">
                      <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {request.profiles.display_name || request.profiles.username} sent you a friend request
                        </p>
                        <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                {friendRequests.length > 3 && (
                  <DropdownMenuItem onClick={handleFriendRequestClick} className="cursor-pointer">
                    <p className="text-sm text-center w-full text-blue-500">
                      View all {friendRequests.length} friend requests
                    </p>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}

            {challenges.length > 0 ? (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Challenges</DropdownMenuLabel>
                {challenges.slice(0, 3).map((challenge) => {
                  const {
                    data: { session },
                  } = supabase.auth.getSession()
                  const currentUserId = session?.user?.id
                  const isChallenger = challenge.challenger_id === currentUserId
                  const otherUser = isChallenger ? challenge.recipient : challenge.challenger

                  let statusText = ""
                  let statusBadge = ""

                  if (challenge.status === "pending") {
                    statusText = isChallenger ? "waiting for response" : "challenged you"
                    statusBadge = "pending"
                  } else if (challenge.status === "accepted") {
                    statusText = isChallenger ? "accepted your challenge" : "challenge accepted"
                    statusBadge = "accepted"
                  } else if (challenge.status === "completed") {
                    const userScore = isChallenger ? challenge.challenger_score : challenge.recipient_score
                    const otherScore = isChallenger ? challenge.recipient_score : challenge.challenger_score

                    if (userScore > otherScore) {
                      statusText = "you won"
                      statusBadge = "won"
                    } else if (userScore < otherScore) {
                      statusText = "you lost"
                      statusBadge = "lost"
                    } else {
                      statusText = "it's a draw"
                      statusBadge = "draw"
                    }
                  }

                  return (
                    <DropdownMenuItem key={challenge.id} onClick={handleChallengeClick} className="cursor-pointer">
                      <div className="flex items-start gap-2 py-1">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{otherUser.display_name || otherUser.username}</p>
                            <Badge
                              variant={
                                statusBadge === "won" ? "success" : statusBadge === "lost" ? "destructive" : "outline"
                              }
                              className="text-xs"
                            >
                              {statusBadge}
                            </Badge>
                          </div>
                          <p className="text-sm truncate">
                            {statusText} - {challenge.quiz.emoji} {challenge.quiz.title}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(challenge.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
                {challenges.length > 3 && (
                  <DropdownMenuItem onClick={handleChallengeClick} className="cursor-pointer">
                    <p className="text-sm text-center w-full text-blue-500">View all {challenges.length} challenges</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
