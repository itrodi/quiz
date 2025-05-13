"use client"

import { useSignIn } from "@farcaster/auth-kit"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function CustomFarcasterButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isSuccess } = useSignIn({
    onSuccess: () => {
      setIsLoading(false)
      window.location.href = "/"
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const handleSignIn = () => {
    setIsLoading(true)
    signIn()
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading || isSuccess}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg
          className="mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )}
      Sign in with Farcaster
    </Button>
  )
}
