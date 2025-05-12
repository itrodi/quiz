import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthKitProvider } from "@/contexts/auth-kit-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrainCast - The Ultimate Quiz Experience on Farcaster",
  description: "Test your knowledge and compete with friends on Farcaster's premier quiz platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://braincast.app/api/og","button":{"title":"Start Quizzing","action":{"type":"launch_frame","name":"BrainCast","url":"https://braincast.app","splashImageUrl":"https://braincast.app/logo.png","splashBackgroundColor":"#0f172a"}}}'
        />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthKitProvider>
            <Header />
            <main className="pb-16">{children}</main>
            <MobileNav />
            <Toaster />
          </AuthKitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
