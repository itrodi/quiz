"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

export default function SocialPage() {
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, total_score")
          .order("total_score", { ascending: false })
          .limit(20)

        if (debouncedSearchQuery) {
          query = query.or(`username.ilike.%${debouncedSearchQuery}%,display_name.ilike.%${debouncedSearchQuery}%`)
        }

        const { data, error } = await query

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [debouncedSearchQuery])

  return (
    <div className="container max-w-md md:max-w-4xl mx-auto px-4 py-4 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Social</h1>

      <div className="mb-6">
        <div className="relative md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            placeholder="Search users by name or username..."
            className="bg-slate-800 border-slate-700 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
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
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="font-bold">{user.total_score} points</div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/social/profile/${user.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}

              {users.length === 0 && <div className="text-center py-8 text-gray-400 col-span-2">No users found</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
