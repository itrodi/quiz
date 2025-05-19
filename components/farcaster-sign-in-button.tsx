"use client"

import { Button } from "@/components/ui/button"

export function FarcasterSignInButton() {
  return (
    <Button
      onClick={() => alert("Authentication is currently disabled")}
      className="w-full bg-purple-600 hover:bg-purple-700"
    >
      Sign in with Farcaster (Disabled)
    </Button>
  )
}
