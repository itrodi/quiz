"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInButton } from "@farcaster/auth-kit"
import { useAuth } from "@/contexts/auth-kit-context"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Connect with your Farcaster account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex justify-center">
              <SignInButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
