import { sdk } from "@farcaster/frame-sdk"

export async function signInWithFarcaster() {
  try {
    const isInMiniApp = await sdk.isInMiniApp()

    if (!isInMiniApp) {
      console.error("Not in a Farcaster mini app environment")
      throw new Error("Not in a Farcaster mini app environment")
    }

    // Generate a secure nonce (would typically be done on the server)
    const nonce = generateNonce()

    // Request sign-in with the nonce
    const signInResult = await sdk.actions.signIn({ nonce })

    if (!signInResult || !signInResult.signature) {
      throw new Error("Failed to get signature from Farcaster")
    }

    // Get user context
    const userContext = sdk.context.user

    if (!userContext || !userContext.fid) {
      throw new Error("Failed to get user context from Farcaster")
    }

    // Send the signature and user data to our backend for verification
    const response = await fetch("/api/auth/farcaster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature: signInResult.signature,
        message: nonce,
        fid: userContext.fid,
        username: userContext.username,
        displayName: userContext.displayName,
        pfpUrl: userContext.pfpUrl,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Authentication failed")
    }

    const authData = await response.json()

    return {
      user: authData.user,
      session: authData.session,
      fid: userContext.fid,
      username: userContext.username,
      displayName: userContext.displayName,
      pfpUrl: userContext.pfpUrl,
    }
  } catch (error) {
    console.error("Error signing in with Farcaster:", error)
    throw error
  }
}

export async function shareToCast(text: string, url?: string) {
  try {
    const isInMiniApp = await sdk.isInMiniApp()

    if (!isInMiniApp) {
      console.error("Not in a Farcaster mini app environment")
      return false
    }

    const embeds = url ? [url] : []

    await sdk.actions.composeCast({
      text,
      embeds: embeds as [string] | [],
    })

    return true
  } catch (error) {
    console.error("Error sharing to Farcaster:", error)
    return false
  }
}

// Helper function to generate a nonce
function generateNonce() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

// Verify a Farcaster signature
export async function verifyFarcasterSignature(message: string, signature: string, fid: number) {
  try {
    // In a real implementation, you would use the Farcaster API to verify the signature
    // This is a simplified example

    // For demo purposes, we'll assume the signature is valid if all parameters are present
    return !!message && !!signature && !!fid

    // In production, you would use something like:
    // const response = await fetch('https://api.farcaster.xyz/v1/verifySignature', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.FARCASTER_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     message,
    //     signature,
    //     fid,
    //   }),
    // })
    // const data = await response.json()
    // return data.valid
  } catch (error) {
    console.error("Error verifying Farcaster signature:", error)
    return false
  }
}
