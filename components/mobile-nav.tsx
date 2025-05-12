"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Trophy, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-kit-context"

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-800 border-t border-slate-700">
      <div className="grid h-full grid-cols-5">
        <Link
          href="/"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700",
            pathname === "/" && "text-purple-400",
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/explore"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700",
            pathname === "/explore" && "text-purple-400",
          )}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        <Link
          href={isAuthenticated ? "/create" : "/login?returnUrl=%2Fcreate"}
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700",
            pathname === "/create" && "text-purple-400",
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs mt-1">Create</span>
        </Link>
        <Link
          href={isAuthenticated ? "/leaderboard" : "/login?returnUrl=%2Fleaderboard"}
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700",
            pathname === "/leaderboard" && "text-purple-400",
          )}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-xs mt-1">Leaderboard</span>
        </Link>
        <Link
          href={isAuthenticated ? "/profile" : "/login?returnUrl=%2Fprofile"}
          className={cn(
            "inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700",
            pathname === "/profile" && "text-purple-400",
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
