import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrainCast - The Ultimate Quiz Experience",
  description: "Test your knowledge and compete with friends on the premier quiz platform",
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
      </head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <MobileNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
