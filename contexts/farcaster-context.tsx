"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { initializeFarcasterApp, promptAddFrame } from "@/lib/farcaster-sdk"

type FarcasterContextType = {
  isMiniApp: boolean
  isLoading: boolean
  user: {
    fid?: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
  client: {
    clientFid?: number
    added?: boolean
    notificationDetails?: {
      url: string
      token: string
    }
  }
  location?: {
    type: string
    [key: string]: any
  }
  addFrame: () => Promise<boolean>
}

const FarcasterContext = createContext<FarcasterContextType>({
  isMiniApp: false,
  isLoading: true,
  user: {},
  client: {},
  addFrame: async () => false,
})

export const useFarcaster = () => useContext(FarcasterContext)

export const FarcasterProvider = ({ children }: { children: ReactNode }) => {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({})
  const [client, setClient] = useState({})
  const [location, setLocation] = useState<any>(undefined)

  useEffect(() => {
    const init = async () => {
      const result = await initializeFarcasterApp()

      if (result.isMiniApp && result.context) {
        setIsMiniApp(true)
        setUser(result.context.user || {})
        setClient(result.context.client || {})
        setLocation(result.context.location)
      }

      setIsLoading(false)
    }

    init()
  }, [])

  const addFrame = async () => {
    return await promptAddFrame()
  }

  return (
    <FarcasterContext.Provider
      value={{
        isMiniApp,
        isLoading,
        user,
        client,
        location,
        addFrame,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  )
}
