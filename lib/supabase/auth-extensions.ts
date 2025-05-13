import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

// Extend the Supabase client with Farcaster authentication methods
declare module "@supabase/supabase-js" {
  interface SupabaseAuthClient {
    signInWithFarcaster(params: {
      fid: number
      message: string
      signature: string
    }): Promise<{
      data: { session: any } | null
      error: Error | null
    }>
  }
}

// Add the signInWithFarcaster method to the Supabase client
export function extendSupabaseAuthWithFarcaster(supabase: SupabaseClient) {
  // Add the signInWithFarcaster method
  supabase.auth.signInWithFarcaster = async ({ fid, message, signature }) => {
    try {
      // Use the existing signInWithPassword method but with a special email format
      // This is a workaround since we can't directly modify Supabase's auth methods
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `farcaster-${fid}@example.com`,
        password: signature.substring(0, 20), // Use part of the signature as a password
      })

      if (error) {
        // If the user doesn't exist, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `farcaster-${fid}@example.com`,
          password: signature.substring(0, 20),
          options: {
            data: {
              fid,
              auth_method: "farcaster",
              message,
              signature_fragment: signature.substring(0, 20),
            },
          },
        })

        if (signUpError) {
          return { data: null, error: signUpError }
        }

        return { data: signUpData, error: null }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  return supabase
}

// Create an extended Supabase client
export function createExtendedSupabaseClient() {
  const supabase = createClientComponentClient()
  return extendSupabaseAuthWithFarcaster(supabase)
}
