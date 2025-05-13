import { createClient } from "@/lib/supabase/server"
import { UserQuizzes } from "@/components/user-quizzes"
import { UserAchievements } from "@/components/user-achievements"
import { UserChallenges } from "@/components/user-challenges"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ProfilePage() {
  const supabase = createClient()

  // Get a default user for demo purposes
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .order("total_score", { ascending: false })
    .limit(1)
    .single()

  // Get user's quizzes
  const { data: userQuizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      categories(*)
    `)
    .eq("creator_id", profile?.id || "")
    .order("created_at", { ascending: false })

  // Get user's scores
  const { data: userScores } = await supabase
    .from("user_scores")
    .select(`
      *,
      quizzes(title, emoji)
    `)
    .eq("user_id", profile?.id || "")
    .order("completed_at", { ascending: false })

  // Get user's achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements(*)
    `)
    .eq("user_id", profile?.id || "")

  // Get user's challenges
  const { data: challengesSent } = await supabase
    .from("challenges")
    .select(`
      *,
      quizzes(title, emoji),
      profiles!challenges_recipient_id_fkey(username, display_name, avatar_url)
    `)
    .eq("challenger_id", profile?.id || "")

  const { data: challengesReceived } = await supabase
    .from("challenges")
    .select(`
      *,
      quizzes(title, emoji),
      profiles!challenges_challenger_id_fkey(username, display_name, avatar_url)
    `)
    .eq("recipient_id", profile?.id || "")

  const challenges = [
    ...(challengesSent || []).map((c) => ({ ...c, type: "sent" })),
    ...(challengesReceived || []).map((c) => ({ ...c, type: "received" })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="container max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
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
        </CardContent>
      </Card>

      <Tabs defaultValue="quizzes">
        <TabsList className="mb-6">
          <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <UserQuizzes quizzes={userQuizzes || []} />
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              {userScores && userScores.length > 0 ? (
                <div className="space-y-4">
                  {userScores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{score.quizzes?.emoji || "🎮"}</div>
                        <div>
                          <p className="font-medium">{score.quizzes?.title || "Unknown Quiz"}</p>
                          <p className="text-sm text-gray-400">{new Date(score.completed_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">{score.percentage}%</p>
                        <p className="text-sm text-gray-400">
                          {score.score}/{score.max_score} in {score.time_taken}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No quiz history available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <UserAchievements achievements={userAchievements || []} />
        </TabsContent>

        <TabsContent value="challenges">
          <UserChallenges challenges={challenges || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
