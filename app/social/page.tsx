import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default async function SocialPage() {
  const supabase = createClient()

  // Get all users for demo purposes
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, total_score")
    .order("total_score", { ascending: false })
    .limit(20)

  return (
    <div className="container max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Social</h1>

      <div className="mb-6">
        <form className="flex gap-2 md:max-w-md">
          <Input type="search" placeholder="Search users..." className="bg-slate-800 border-slate-700" />
        </form>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users?.map((user) => (
              <Link href={`/social/profile/${user.id}`} key={user.id}>
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.display_name?.charAt(0) || user.username?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.display_name || user.username || "Anonymous"}</div>
                      {user.username && <div className="text-sm text-gray-400">@{user.username}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{user.total_score} points</div>
                  </div>
                </div>
              </Link>
            ))}

            {(!users || users.length === 0) && <div className="text-center py-8 text-gray-400">No users found</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
