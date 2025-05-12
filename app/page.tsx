import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"
import Link from "next/link"
import { FeaturedQuizzes } from "@/components/featured-quizzes"
import { PopularCategories } from "@/components/popular-categories"
import { TrendingQuizzes } from "@/components/trending-quizzes"

export default function Home() {
  return (
    <div className="container max-w-md mx-auto px-4 py-4">
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 mb-3">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">BrainCast</h1>
        <p className="text-sm text-slate-300">The Ultimate Quiz Experience</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button className="w-full" size="sm" asChild>
          <Link href="/explore">Explore Quizzes</Link>
        </Button>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/create">Create Quiz</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Featured</h2>
            <Link href="/explore?filter=featured" className="text-xs text-purple-400">
              See all
            </Link>
          </div>
          <FeaturedQuizzes />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Categories</h2>
            <Link href="/categories" className="text-xs text-purple-400">
              See all
            </Link>
          </div>
          <PopularCategories />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Trending Now</h2>
            <Link href="/explore?filter=trending" className="text-xs text-purple-400">
              See all
            </Link>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <TrendingQuizzes />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
