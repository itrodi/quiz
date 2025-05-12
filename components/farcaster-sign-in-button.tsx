"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSignIn } from "@farcaster/auth-kit"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export function FarcasterSignInButton() {
  const [isClient, setIsClient] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const { signIn, signOut, isPolling, isSuccess, data } = useSignIn({
    onSuccess: ({ fid, username }) => {
      console.log(`Successfully signed in with Farcaster: ${username || "unknown"} (${fid})`)
    },
    onError: (error) => {
      console.error("Error signing in with Farcaster:", error)
    },
  })

  // Safely access data properties
  const username = data?.username
  const pfpUrl = data?.pfpUrl

  if (!isClient) {
    return (
      <Button disabled className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isSuccess && username) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {pfpUrl && (
            <Image src={pfpUrl || "/placeholder.svg"} alt={username} width={40} height={40} className="rounded-full" />
          )}
          <div>
            <p className="font-semibold">Welcome, {username}!</p>
            <p className="text-xs text-gray-400">You're signed in with Farcaster</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => signOut()} className="text-sm">
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {!showQR ? (
        <Button
          onClick={() => {
            signIn()
            setShowQR(true)
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 w-full"
          disabled={isPolling}
        >
          {isPolling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path
                d="M31.3412 16.172C31.3412 24.9947 24.4386 32.0003 16.0016 32.0003C7.56465 32.0003 0.662109 24.9947 0.662109 16.172C0.662109 7.34932 7.56465 0.34375 16.0016 0.34375C24.4386 0.34375 31.3412 7.34932 31.3412 16.172Z"
                fill="#8A63D2"
              />
              <path
                d="M23.9057 11.8566C22.6058 11.8566 21.5521 10.8385 21.5521 9.57192C21.5521 8.30537 22.6058 7.28516 23.9057 7.28516C25.2056 7.28516 26.2594 8.30328 26.2594 9.57192C26.2594 10.8427 25.2056 11.8566 23.9057 11.8566ZM8.77521 21.4513H13.4821V18.6973H11.1285V16.3907H8.77521V21.4513ZM11.1285 11.8566H8.77521V16.3907H11.1285V11.8566ZM21.5521 16.3907H23.9057V11.8566H21.5521V16.3907ZM16.2759 11.8566H13.4821V23.315H16.2759V18.6973H18.6291V16.3907H16.2759V11.8566ZM18.6291 11.8566V9.08418H16.2759V11.8566H18.6291ZM13.9341 9.08418H11.1285V11.8566H13.9341V9.08418Z"
                fill="white"
              />
            </svg>
          )}
          Sign in with Farcaster
        </Button>
      ) : (
        <div className="flex flex-col items-center p-4">
          {isPolling && (
            <>
              <div className="text-sm text-center mb-4">
                <p className="font-medium">Scan QR code with your Warpcast app</p>
                <p className="text-gray-400 text-xs mt-1">Or click the button on mobile devices</p>
              </div>
              {/* The QR code will load here */}
              <Card className="p-4 bg-white">
                {/* Check if url exists to avoid errors */}
                {data?.qrCodeUrl && (
                  <Image
                    src={data.qrCodeUrl || "/placeholder.svg"}
                    alt="Farcaster sign in QR code"
                    width={200}
                    height={200}
                  />
                )}
              </Card>
              <Button variant="ghost" onClick={() => setShowQR(false)} className="mt-4 text-sm" size="sm">
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
