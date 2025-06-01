import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthProvider } from "@/contexts/auth-kit-context"
import { Toaster } from "@/components/ui/toaster"
import { FarcasterWrapper } from "@/components/farcaster-wrapper"

const inter = Inter({ subsets: ["latin"] })

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com" // Fallback URL
const ogImageUrl = `${appUrl}/api/og`
const splashImageUrl = `${appUrl}/splash.png` // Assume you'll add a splash.png to /public

export const metadata: Metadata = {
  title: "BrainCast - The Ultimate Quiz Experience",
  description: "Test your knowledge and learn with interactive quizzes on BrainCast, now as a Farcaster Mini App!",
  generator: "v0.dev",
  openGraph: {
    title: "BrainCast - The Ultimate Quiz Experience",
    description: "Interactive quizzes on Farcaster.",
    images: [ogImageUrl],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next", // or "1" as per some docs, vNext is common
      name: "BrainCast",
      imageUrl: ogImageUrl,
      "button:1": "Launch BrainCast",
      post_url: `${appUrl}/api/farcaster/frame`, // A simple frame endpoint if needed, or remove if not using frame actions directly from the share
      "action:button:1": "launch_frame",
      "action:button:1:url": appUrl,
      "action:button:1:name": "BrainCast",
      "action:button:1:splashImageUrl": splashImageUrl,
      "action:button:1:splashBackgroundColor": "#0f172a", // Matches your dark theme
    }),
    // Alternative simpler launch frame meta for direct mini-app launch
    // "fc:frame": `vNext`,
    // "fc:frame:image": ogImageUrl,
    // "fc:frame:button:1": "Launch BrainCast",
    // "fc:frame:button:1:action": "link",
    // "fc:frame:button:1:target": appUrl, // This would just link, for mini-app launch use the more complex structure or ensure client handles it.
    // The guide suggests:
    // <meta name="fc:frame" content='{"version":"next","imageUrl":"https://yourapp.com/share-image.png","button":{"title":"Open App","action":{"type":"launch_frame","url":"https://yourapp.com","name":"Your App","splashImageUrl":"https://yourapp.com/splash.png","splashBackgroundColor":"#000000"}}}' />
    // So, let's use that structure, ensuring it's a string value for the meta tag.
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add the specific meta tag structure for Farcaster frames */}
        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: "next",
            imageUrl: ogImageUrl,
            button: {
              title: "Launch BrainCast",
              action: {
                type: "launch_frame",
                url: appUrl,
                name: "BrainCast",
                splashImageUrl: splashImageUrl,
                splashBackgroundColor: "#0f172a",
              },
            },
          })}
        />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        <FarcasterWrapper>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <MobileNav />
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </FarcasterWrapper>
      </body>
    </html>
  )
}
