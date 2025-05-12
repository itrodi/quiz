"use client"

import { QuizGrid } from "@/components/quiz-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { CategoryFilter } from "@/components/category-filter"
import { useState } from "react"
import { useProfile } from "@farcaster/auth-kit"
import { useRouter } from "next/navigation"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const { isAuthenticated } = useProfile()
  const router = useRouter()

  return (
    <div className="container max-w-md mx-auto px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Explore Quizzes</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search quizzes..."
          className="pl-9 bg-slate-800 border-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <CategoryFilter
        onCategorySelect={(category) => setSelectedCategory(category)}
        selectedCategory={selectedCategory}
      />

      <Tabs defaultValue="all" className="w-full mt-4" onValueChange={setFilter}>
        <TabsList className="grid grid-cols-4 mb-4 bg-slate-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <QuizGrid filter="all" category={selectedCategory} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="popular">
          <QuizGrid filter="popular" category={selectedCategory} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="new">
          <QuizGrid filter="new" category={selectedCategory} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="friends">
          {isAuthenticated ? (
            <QuizGrid filter="friends" category={selectedCategory} searchQuery={searchQuery} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-400 mb-4">Sign in to see quizzes from friends</p>
              <Button size="sm" onClick={() => router.push("/login")}>
                Sign in with Farcaster
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
