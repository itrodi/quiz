import { SignInForm } from "@/components/auth/sign-in-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FarcasterSignInButton } from "@/components/farcaster-sign-in-button"

export default async function LoginPage() {
  const supabase = createClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <FarcasterSignInButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
