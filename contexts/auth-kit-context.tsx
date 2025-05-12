"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useProfile, useSignInMessage, useSignIn } from "@farcaster/auth-kit"
import { createClient } from "@/lib/supabase/client"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  profile: any
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  profile: null,
  signOut: async () => {},
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthKitProvider = ({ children }: { children: ReactNode }) => {
  // Get authentication state from Farcaster AuthKit
  const { isAuthenticated: isFarcasterAuthenticated, profile: farcasterProfile } = useProfile()
  const { message, signature } = useSignInMessage()
  const { signOut: farcasterSignOut } = useSignIn({})

  // Local auth state
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Sync Farcaster authentication with Supabase
  useEffect(() => {
    const syncAuth = async () => {
      if (isFarcasterAuthenticated && farcasterProfile && message && signature) {
        try {
          setIsLoading(true)

          // Authenticate with Supabase using Farcaster credentials
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "farcaster",
            options: {
              queryParams: {
                message,
                signature,
                fid: farcasterProfile.fid?.toString() || "",
                username: farcasterProfile.username || "",
                display_name: farcasterProfile.displayName || "",
                pfp_url: farcasterProfile.pfpUrl || "",
              },
            },
          })

          if (error) {
            console.error("Authentication error:", error)
            setError(error.message)
            return
          }

          // Get user profile from Supabase
          const { data: userData } = await supabase
            .from("profiles")
            .select("*")
            .eq("fid", farcasterProfile.fid)
            .single()

          setProfile(userData || farcasterProfile)
          setIsAuthenticated(true)
        } catch (err) {
          console.error("Error during authentication:", err)
          setError(err instanceof Error ? err.message : "Unknown error during authentication")
        } finally {
          setIsLoading(false)
        }
      } else if (!isFarcasterAuthenticated) {
        setIsAuthenticated(false)
        setProfile(null)
        setIsLoading(false)
      }
    }

    syncAuth()
  }, [isFarcasterAuthenticated, farcasterProfile, message, signature, supabase])

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Get user profile from Supabase
          const { data: userData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(userData)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error("Error checking session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [supabase])

  // Sign out function
  const signOut = async () => {
    try {
      await farcasterSignOut()
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setProfile(null)
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, profile, signOut, error }}>
      {children}
    </AuthContext.Provider>
  )
}
