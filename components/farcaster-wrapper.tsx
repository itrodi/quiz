"use client"

import { sdk } from "@farcaster/frame-sdk"
import { useEffect, useState } from "react"
import type React from "react"

export function FarcasterWrapper({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initFarcasterSDK() {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(inMiniApp)
        if (inMiniApp) {
          console.log("Running in Farcaster Mini App environment.")
          // You can access context like sdk.context here if needed
          // e.g., const context = sdk.context;
        }
        // Signal ready to hide splash screen
        await sdk.actions.ready({
          disableNativeGestures: false, // Or true if you handle all gestures
        })
      } catch (error) {
        console.error("Error initializing Farcaster SDK:", error)
      } finally {
        setIsLoading(false)
      }
    }
    initFarcasterSDK()
  }, [])

  // You could show a loader here, but often sdk.actions.ready() handles the splash screen.
  // if (isLoading) {
  //   return <div>Loading Farcaster SDK...</div>;
  // }

  return <>{children}</>
}
