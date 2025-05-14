import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function LeaderboardPage() {
  const supabase = createClient()

  // Fetch global leaderboard data
  const { data: globalLeaderboard } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, total_score, quizzes_taken")
    .order("total_score", { ascending: false })
    .limit(20)

  // Fetch weekly leaderboard data
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: weeklyScores } = await supabase
    .from("user_scores")
    .select("user_id, score")
    .gte("completed_at", oneWeekAgo.toISOString())

  // Aggregate weekly scores by user
  const weeklyScoresByUser: Record<string, number> = {}
  weeklyScores?.forEach((score) => {
    if (!weeklyScoresByUser[score.user_id]) {
      weeklyScoresByUser[score.user_id] = 0
    }
    weeklyScoresByUser[score.user_id] += score.score
  })

  // Fetch user profiles for weekly leaderboard
  const weeklyUserIds = Object.keys(weeklyScoresByUser)
  const { data: weeklyUsers } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, quizzes_taken")
    .in("id", weeklyUserIds.length > 0 ? weeklyUserIds : ["no-results"])

  // Combine weekly scores with user profiles
  const weeklyLeaderboard = weeklyUsers
    ?.map((user) => ({
      ...user,
      total_score: weeklyScoresByUser[user.id] || 0,
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 20)

  // Fetch achievement counts manually since we can't use group
  const { data: userAchievements } = await supabase.from("user_achievements").select("user_id").eq("unlocked", true)

  // Count achievements per user
  const achievementCountsByUser: Record<string, number> = {}
  userAchievements?.forEach((achievement) => {
    if (!achievementCountsByUser[achievement.user_id]) {
      achievementCountsByUser[achievement.user_id] = 0
    }
    achievementCountsByUser[achievement.user_id]++
  })

  // Convert to array and sort
  const achievementCounts = Object.entries(achievementCountsByUser)
    .map(([user_id, count]) => ({ user_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Fetch user profiles for achievement leaderboard
  const achievementUserIds = achievementCounts.map((item) => item.user_id)
  const { data: achievementUsers } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", achievementUserIds.length > 0 ? achievementUserIds : ["no-results"])

  // Combine achievement counts with user profiles
  const achievementLeaderboard = achievementCounts
    .map((item) => {
      const user = achievementUsers?.find((u) => u.id === item.user_id)
      return {
        ...user,
        achievement_count: item.count,
      }
    })
    .filter((item) => item.username) // Filter out any undefined users

  return (
    <div className="container max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Leaderboards</h1>

      <Tabs defaultValue="global" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalLeaderboard?.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold text-gray-400">{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.display_name || user.username || "Anonymous"}</div>
                        <div className="text-sm text-gray-400">{user.quizzes_taken} quizzes taken</div>
                      </div>
                    </div>
                    <div className="font-bold text-xl">{user.total_score}</div>
                  </div>
                ))}

                {(!globalLeaderboard || globalLeaderboard.length === 0) && (
                  <div className="text-center py-8 text-gray-400">No data available yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyLeaderboard?.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold text-gray-400">{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.display_name || user.username || "Anonymous"}</div>
                        <div className="text-sm text-gray-400">{user.quizzes_taken} quizzes taken</div>
                      </div>
                    </div>
                    <div className="font-bold text-xl">{user.total_score}</div>
                  </div>
                ))}

                {(!weeklyLeaderboard || weeklyLeaderboard.length === 0) && (
                  <div className="text-center py-8 text-gray-400">No data available for this week yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Achievement Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievementLeaderboard?.map((user, index) => (
                  <div key={user?.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold text-gray-400">{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user?.display_name || user?.username || "Anonymous"}</div>
                      </div>
                    </div>
                    <div className="font-bold text-xl">
                      {user?.achievement_count} <span className="text-sm font-normal">achievements</span>
                    </div>
                  </div>
                ))}

                {(!achievementLeaderboard || achievementLeaderboard.length === 0) && (
                  <div className="text-center py-8 text-gray-400">No achievements unlocked yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Weekly Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="mb-4">Complete 5 quizzes this week to earn bonus points!</p>
              <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden mb-2">
                <div className="bg-green-500 h-full" style={{ width: "40%" }}></div>
              </div>
              <p className="text-sm text-gray-400">2 of 5 quizzes completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-2">
                #5 <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <p className="text-sm text-slate-400">Keep playing to improve your rank!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
