"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // If already authenticated, redirect to home
  if (isAuthenticated && !isLoading) {
    router.push("/")
    return null
  }

  const handleFarcasterSignIn = async () => {
    try {
      setIsSigningIn(true)

      // Check if we're in a Farcaster mini app environment
      const isFarcasterEnvironment = typeof window !== "undefined" && window.parent !== window && "sdk" in window

      if (!isFarcasterEnvironment) {
        // For development/testing outside Farcaster
        toast({
          title: "Development Mode",
          description: "Farcaster SDK not detected. This would normally open the Farcaster sign-in flow.",
        })
        setIsSigningIn(false)
        return
      }

      // Generate a nonce
      const nonce = Math.random().toString(36).substring(2, 15)

      // @ts-ignore - Farcaster SDK
      const result = await window.sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true,
      })

      if (result?.message && result?.signature) {
        await signIn(result.message, result.signature)
        toast({
          title: "Success!",
          description: "You've successfully signed in with Farcaster.",
        })
      }
    } catch (error) {
      console.error("Error signing in with Farcaster:", error)
      toast({
        title: "Sign In Failed",
        description: "There was an error signing in with Farcaster. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to BrainCast</CardTitle>
          <CardDescription>
            Sign in to track your progress, compete with friends, and create your own quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleFarcasterSignIn} disabled={isSigningIn || isLoading} className="w-full">
            {isSigningIn ? "Signing in..." : "Sign in with Farcaster"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  )
}
