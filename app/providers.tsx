"use client"

import { AuthKitProvider } from "@farcaster/auth-kit"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  // Get the environment variables
  const optimismRpcUrl = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io"
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Configure AuthKit
  const config = {
    domain: domain,
    siweUri: `${appUrl}/login`,
    rpcUrl: optimismRpcUrl,
    relay: "https://relay.farcaster.xyz",
    version: "v1",
  }

  console.log("AuthKit Config:", config)

  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
