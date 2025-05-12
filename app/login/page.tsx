"use client"

import { useEffect, useState } from "react"
import { FarcasterSignInButton } from "@/components/farcaster-sign-in-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-kit-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)

  const returnUrl = searchParams.get("returnUrl")

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setRedirecting(true)
      // Redirect to returnUrl if available, otherwise to home
      const redirectUrl = returnUrl ? decodeURIComponent(returnUrl) : "/"
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, returnUrl])

  if (redirecting) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to BrainCast</CardTitle>
          <CardDescription>Sign in with your Farcaster account to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <FarcasterSignInButton />

          <div className="text-sm text-slate-400 text-center mt-4">
            <p>By signing in, you'll be able to create quizzes, track your progress, and compete with friends.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
