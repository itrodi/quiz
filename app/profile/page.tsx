"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserAchievements } from "@/components/user-achievements"
import { UserChallenges } from "@/components/user-challenges"
import { Loader2, PencilIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-kit-context"
import Link from "next/link"

export default function ProfilePage() {
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { profile, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !profile) return

      setLoading(true)
      try {
        // Get user's achievements
        const { data: achievements } = await supabase
          .from("user_achievements")
          .select(`
            *,
            achievements(*)
          `)
          .eq("user_id", profile.id)

        setUserAchievements(achievements || [])
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [profile, isAuthenticated])

  if (!isAuthenticated || !profile) {
    return (
      <div className="container flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="mb-4">You need to be logged in to view your profile.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.pfpUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.displayName?.charAt(0) || profile.username?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">{profile.displayName || profile.username || "Anonymous"}</h1>
              {profile.username && <p className="text-gray-400 mb-4">@{profile.username}</p>}

              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.totalScore || 0}</p>
                  <p className="text-sm text-gray-400">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.quizzesTaken || 0}</p>
                  <p className="text-sm text-gray-400">Quizzes Taken</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.quizzesCreated || 0}</p>
                  <p className="text-sm text-gray-400">Quizzes Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userAchievements?.filter((a) => a.unlocked).length || 0}</p>
                  <p className="text-sm text-gray-400">Achievements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end mt-6">
            <Button asChild>
              <Link href="/profile/edit">
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges">
        <TabsList className="mb-6">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <UserAchievements achievements={userAchievements} />
        </TabsContent>

        <TabsContent value="challenges">
          <UserChallenges userId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
