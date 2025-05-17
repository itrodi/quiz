"use client"

import { Button } from "@/components/ui/button"
import { useFarcaster } from "@/contexts/farcaster-context"
import { PlusCircle } from "lucide-react"

export function AddFramePrompt() {
  const { isMiniApp, client, addFrame } = useFarcaster()

  if (!isMiniApp || client.added) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center p-4 md:bottom-4">
      <Button onClick={addFrame} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
        <PlusCircle className="h-4 w-4" />
        Add BrainCast to Your Apps
      </Button>
    </div>
  )
}
