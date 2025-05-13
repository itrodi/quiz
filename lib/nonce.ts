export function generateNonce(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const randomValues = new Uint8Array(length)

  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * charset.length)
    }
  }

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }

  return result
}

// Store and retrieve nonces from session storage
export function storeNonce(nonce: string): void {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("auth_nonce", nonce)
  }
}

export function retrieveNonce(): string | null {
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem("auth_nonce")
  }
  return null
}

export function clearNonce(): void {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("auth_nonce")
  }
}
