import { sdk } from "@farcaster/frame-sdk"

export const initializeFarcasterApp = async () => {
  try {
    // Check if we're in a Farcaster Mini App environment
    const isMiniApp = await sdk.isInMiniApp()

    if (isMiniApp) {
      // Hide the splash screen when the app is ready
      await sdk.actions.ready()

      // Return the context information
      return {
        isMiniApp,
        context: sdk.context,
      }
    }

    return { isMiniApp: false }
  } catch (error) {
    console.error("Error initializing Farcaster app:", error)
    return { isMiniApp: false }
  }
}

export const promptAddFrame = async () => {
  try {
    await sdk.actions.addFrame()
    return true
  } catch (error) {
    console.error("Error adding frame:", error)
    return false
  }
}

export const sendNotification = async (
  token: string,
  url: string,
  notificationId: string,
  title: string,
  body: string,
  targetUrl: string,
) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokens: [token],
        notificationId,
        title,
        body,
        targetUrl,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}
