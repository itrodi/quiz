"use client"

import { Home, Search, Trophy, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useFarcaster } from "@/contexts/farcaster-context"

export function MobileNav() {
  const pathname = usePathname()
  const { isMiniApp } = useFarcaster()

  if (isMiniApp) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-800 md:hidden">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center justify-center py-2 ${
            pathname === "/" ? "text-white" : "text-slate-400"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href="/explore"
          className={`flex flex-1 flex-col items-center justify-center py-2 ${
            pathname === "/explore" ? "text-white" : "text-slate-400"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Explore</span>
        </Link>
        <Link
          href="/leaderboard"
          className={`flex flex-1 flex-col items-center justify-center py-2 ${
            pathname === "/leaderboard" ? "text-white" : "text-slate-400"
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs">Leaderboard</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-center py-2 ${
            pathname === "/profile" ? "text-white" : "text-slate-400"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  )
}
