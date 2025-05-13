import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthKitProvider } from "@/contexts/auth-kit-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BrainCast",
  description: "Learn and earn with web3 quizzes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthKitProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
            </div>
          </AuthKitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
