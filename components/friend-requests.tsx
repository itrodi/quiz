"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function FriendRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchFriendRequests = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/friends?status=pending")
        if (!response.ok) throw new Error("Failed to fetch friend requests")

        const data = await response.json()
        setRequests(data)
      } catch (error) {
        console.error("Error fetching friend requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFriendRequests()
  }, [])

  const handleAccept = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(`/api/friends/${requestId}/accept`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to accept friend request")

      // Remove the request from the list
      setRequests(requests.filter((req) => req.id !== requestId))

      toast({
        title: "Friend request accepted",
        description: "You are now friends with this user.",
      })
    } catch (error) {
      console.error("Error accepting friend request:", error)
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  const handleDecline = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(`/api/friends/${requestId}/decline`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to decline friend request")

      // Remove the request from the list
      setRequests(requests.filter((req) => req.id !== requestId))

      toast({
        title: "Friend request declined",
        description: "The friend request has been declined.",
      })
    } catch (error) {
      console.error("Error declining friend request:", error)
      toast({
        title: "Error",
        description: "Failed to decline friend request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">No pending friend requests</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={request.sender.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.sender.display_name?.charAt(0) || request.sender.username?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{request.sender.display_name || request.sender.username}</div>
                  {request.sender.username && <div className="text-sm text-gray-400">@{request.sender.username}</div>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAccept(request.id)}
                  disabled={actionLoading[request.id]}
                >
                  {actionLoading[request.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(request.id)}
                  disabled={actionLoading[request.id]}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
