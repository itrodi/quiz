"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/contexts/auth-kit-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { SignInButton } from "@farcaster/auth-kit"

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">BrainCast</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/explore") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/quizzes"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/quizzes") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Quizzes
            </Link>
            <Link
              href="/social"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/social") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Social
            </Link>
            <Link
              href="/leaderboard"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/leaderboard") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Leaderboard
            </Link>
          </nav>
        </div>
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:block">{/* Search component can go here */}</div>
          </div>
          <nav className="flex items-center">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.pfpUrl || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button className="w-full cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SignInButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
