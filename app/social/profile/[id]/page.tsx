import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserQuizzes } from "@/components/user-quizzes"
import { UserAchievements } from "@/components/user-achievements"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const userId = params.id

  // Get the user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error || !profile) {
    notFound()
  }

  // Get user's quizzes
  const { data: userQuizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      categories(*)
    `)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  // Get user's achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements(*)
    `)
    .eq("user_id", userId)

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8 bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">{profile?.display_name || profile?.username || "Anonymous"}</h1>
              {profile?.username && <p className="text-gray-400 mb-4">@{profile.username}</p>}

              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.total_score || 0}</p>
                  <p className="text-sm text-gray-400">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.quizzes_taken || 0}</p>
                  <p className="text-sm text-gray-400">Quizzes Taken</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile?.quizzes_created || 0}</p>
                  <p className="text-sm text-gray-400">Quizzes Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userAchievements?.filter((a) => a.unlocked).length || 0}</p>
                  <p className="text-sm text-gray-400">Achievements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end mt-6 gap-2">
            <Button variant="outline">Add Friend</Button>
            <Button>Challenge</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="quizzes">
        <TabsList className="mb-6">
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <UserQuizzes quizzes={userQuizzes || []} />
        </TabsContent>

        <TabsContent value="achievements">
          <UserAchievements achievements={userAchievements || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
