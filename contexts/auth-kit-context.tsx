"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  profile: any
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true, // Always authenticated for now
  isLoading: false,
  profile: {
    username: "demo_user",
    displayName: "Demo User",
    pfpUrl: "/diverse-avatars.png",
  },
  signOut: async () => {},
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthKitProvider = ({ children }: { children: ReactNode }) => {
  // Simplified context that doesn't require environment variables
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  // Mock profile for demo purposes
  const profile = {
    username: "demo_user",
    displayName: "Demo User",
    pfpUrl: "/diverse-avatars.png",
  }

  const signOut = async () => {
    console.log("Sign out functionality is disabled")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: true, // Always authenticated for now
        isLoading,
        profile,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
