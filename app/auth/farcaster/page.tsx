"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Icons } from "@/components/icons"

export default function FarcasterAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("farcaster")
      router.push("/")
    } catch (err) {
      console.error("Error signing in:", err)
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String(err.message)
          : "Failed to sign in with Farcaster. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Sign in with Farcaster</CardTitle>
          <CardDescription>Connect your Farcaster account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Icons.farcaster className="h-5 w-5" />
                  Continue with Farcaster
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 text-sm bg-red-900/20 border border-red-900/50 rounded-md text-red-500">{error}</div>
            )}

            <div className="text-sm text-slate-400 mt-2">
              <p>Note: You must be using a Farcaster client that supports the Frame SDK.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
