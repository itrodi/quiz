"use client"

import { useProfile } from "@farcaster/auth-kit"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, profile } = useProfile()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Welcome back, {profile?.username || "User"}!</h1>
            <p className="text-gray-600 mb-6">Continue your learning journey with our latest quizzes and challenges.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/quizzes"
                className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100"
              >
                <h2 className="font-semibold text-lg mb-2">Browse Quizzes</h2>
                <p className="text-sm text-gray-600">Explore our collection of quizzes on various topics.</p>
              </Link>

              <Link href="/leaderboard" className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100">
                <h2 className="font-semibold text-lg mb-2">Leaderboard</h2>
                <p className="text-sm text-gray-600">See how you rank against other players.</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to BrainCast</h1>
            <p className="text-xl text-gray-600 mb-8">
              Test your knowledge with fun quizzes designed for the Farcaster community.
            </p>

            <Link
              href="/login"
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-block"
            >
              Sign in with Farcaster
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
