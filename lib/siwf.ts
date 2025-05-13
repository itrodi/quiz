import { createHash } from "crypto"

// Parse the SIWE message to extract user data
export function parseSIWFMessage(message: string) {
  try {
    // Example message format:
    // "farcaster://farcaster.xyz/login?domain=example.com&nonce=abcdef123456&uri=https://example.com/login&issued_at=2023-09-01T12:00:00.000Z"

    const url = new URL(message)

    if (url.protocol !== "farcaster:") {
      throw new Error("Invalid protocol in SIWF message")
    }

    const params = new URLSearchParams(url.search)
    const domain = params.get("domain")
    const nonce = params.get("nonce")
    const uri = params.get("uri")
    const issuedAt = params.get("issued_at")

    if (!domain || !nonce || !uri || !issuedAt) {
      throw new Error("Missing required parameters in SIWF message")
    }

    return { domain, nonce, uri, issuedAt }
  } catch (error) {
    console.error("Error parsing SIWF message:", error)
    throw new Error("Invalid SIWF message format")
  }
}

// Verify the SIWF message and signature
export async function verifySIWFSignature(message: string, signature: string) {
  try {
    // In a production environment, you would use a library like siwe or ethers.js
    // to verify the signature, or use a service like Neynar if preferred

    // For this example, we'll use a simplified approach to demonstrate the concept
    // This is NOT secure for production use

    // Extract the FID and other data from the signature
    // In a real implementation, you would verify the signature cryptographically

    // This is a placeholder for demonstration purposes
    const messageHash = createHash("sha256").update(message).digest("hex")

    // In a real implementation, you would verify that the signature was created by the user's key
    // and extract the FID and other user data from the verification result

    // For demo purposes, we'll extract a mock FID from the signature
    const mockFid = Number.parseInt(signature.substring(0, 8), 16) % 10000

    return {
      verified: true,
      fid: mockFid,
      username: `user_${mockFid}`,
      displayName: `User ${mockFid}`,
      pfpUrl: `/placeholder.svg?height=200&width=200&query=user${mockFid}`,
    }
  } catch (error) {
    console.error("Error verifying SIWF signature:", error)
    return { verified: false }
  }
}
