"use client"

import { useEffect } from "react"
import { useProfile } from "@farcaster/auth-kit"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Import the actual quiz creation component
import { QuizCreator } from "@/components/quiz-creator"

export default function CreatePage() {
  const { isAuthenticated, isLoading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnUrl=%2Fcreate")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <QuizCreator />
}
