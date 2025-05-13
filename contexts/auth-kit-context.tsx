"use client"

import type React from "react"

import "@farcaster/auth-kit/styles.css"
import { AuthKitProvider as FarcasterAuthKitProvider } from "@farcaster/auth-kit"
import { useProfile } from "@farcaster/auth-kit"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a context for our custom auth hook
const AuthContext = createContext<ReturnType<typeof useAuthState> | undefined>(undefined)

// Custom hook that combines Farcaster AuthKit with our app's auth logic
function useAuthState() {
  const { isAuthenticated, profile } = useProfile()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (isAuthenticated && profile) {
      // When authenticated with Farcaster, update our user state
      setUser({
        id: `farcaster:${profile.fid}`,
        fid: profile.fid,
        username: profile.username,
        displayName: profile.displayName,
        pfpUrl: profile.pfpUrl,
        bio: profile.bio,
        provider: "farcaster",
      })
      setIsLoading(false)

      // Optionally sync with Supabase
      const syncUserWithSupabase = async () => {
        try {
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("farcaster_fid", profile.fid)
            .single()

          if (!existingUser) {
            // Create user in Supabase if they don't exist
            await supabase.from("users").insert({
              farcaster_fid: profile.fid,
              username: profile.username,
              display_name: profile.displayName,
              avatar_url: profile.pfpUrl,
              bio: profile.bio,
            })
          }
        } catch (error) {
          console.error("Error syncing user with Supabase:", error)
        }
      }

      syncUserWithSupabase()
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [isAuthenticated, profile, supabase])

  return {
    user,
    isAuthenticated,
    isLoading,
    profile,
  }
}

// Export the useAuth hook that components will use
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthKitProvider")
  }
  return context
}

// AuthKit provider component
export function AuthKitProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const config = {
    domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "braincast.app",
    siweUri: process.env.NEXT_PUBLIC_APP_URL || "https://braincast.app",
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  }

  const auth = useAuthState()

  return (
    <FarcasterAuthKitProvider config={config}>
      <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
    </FarcasterAuthKitProvider>
  )
}
