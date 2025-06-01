"use client"

import { useAuth } from "@/contexts/auth-kit-context"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function FarcasterSignInButton() {
  const { signInWithFarcaster, farcasterUser, isLoading } = useAuth()

  if (farcasterUser) {
    // Optionally, display something if already signed in with Farcaster
    // For now, we assume this button is primarily for initiating the sign-in
    return null
  }

  return (
    <Button
      onClick={signInWithFarcaster}
      disabled={isLoading}
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
    >
      {/* You might need to add a Farcaster logo to your public folder or use an SVG component */}
      {/* <Image src="/farcaster-logo.png" alt="Farcaster" width={20} height={20} /> */}
      <LogIn className="h-4 w-4 mr-2" />
      Sign In with Farcaster
    </Button>
  )
}
