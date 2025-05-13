import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { cookies } from "next/headers"

export const createServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerComponentClient({ cookies: () => cookieStore })
}
