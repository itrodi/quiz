"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Users, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: Search,
  },
  {
    name: "Social",
    href: "/social",
    icon: Users,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-800 border-t border-slate-700 md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors",
              pathname === item.href && "text-white",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
        <Link
          href={isAuthenticated ? "/profile" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors",
            (pathname === "/profile" || pathname === "/login") && "text-white",
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">{isAuthenticated ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  )
}
