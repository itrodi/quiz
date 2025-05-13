"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-kit-context"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/social", label: "Social" },
  ]

  const authItems = isAuthenticated ? [{ href: "/profile", label: "Profile" }] : [{ href: "/login", label: "Login" }]

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="relative z-50"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <nav className="fixed inset-0 flex flex-col items-center justify-center space-y-6 p-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xl font-medium ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px w-16 bg-border" />
            {authItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xl font-medium ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <div className="mt-4 flex flex-col items-center">
                <div className="mb-2 text-sm text-muted-foreground">Signed in as</div>
                <div className="font-medium">{user.username || user.email}</div>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
