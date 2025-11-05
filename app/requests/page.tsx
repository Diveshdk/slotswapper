"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { acceptSwapRequestAction, rejectSwapRequestAction } from "@/app/actions/swap-actions"
import { formatDateTimeLocal } from "@/lib/utils/time-utils"

interface SwapRequest {
  id: string
  requester_id: string
  responder_id: string
  requester_slot_id: string
  responder_slot_id: string
  status: string
  updated_at: string
  requester_slot?: { title: string; start_time: string; end_time: string }
  responder_slot?: { title: string; start_time: string; end_time: string }
}

export default function RequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: incoming, error: inError } = await supabase
        .from("swap_requests")
        .select(
          `
          *,
          requester_slot:requester_slot_id(title, start_time, end_time),
          responder_slot:responder_slot_id(title, start_time, end_time)
        `,
        )
        .eq("responder_id", user.id)
        .order("updated_at", { ascending: false })

      if (inError) throw inError

      const { data: outgoing, error: outError } = await supabase
        .from("swap_requests")
        .select(
          `
          *,
          requester_slot:requester_slot_id(title, start_time, end_time),
          responder_slot:responder_slot_id(title, start_time, end_time)
        `,
        )
        .eq("requester_id", user.id)
        .order("updated_at", { ascending: false })

      if (outError) throw outError

      console.log("[v0] Incoming requests:", incoming)
      console.log("[v0] Outgoing requests:", outgoing)

      setIncomingRequests(incoming || [])
      setOutgoingRequests(outgoing || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }, [supabase])

  useEffect(() => {
    fetchRequests()
    setIsLoading(false)

    const channel = supabase
      .channel("swap_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "swap_requests",
        },
        (payload) => {
          console.log("[v0] Real-time swap request update:", payload)
          fetchRequests()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [fetchRequests, supabase])

  const handleResponse = async (requestId: string, accept: boolean) => {
    const request = incomingRequests.find((r) => r.id === requestId)
    if (!request) return

    setProcessingId(requestId)
    try {
      console.log("[v0] Processing swap response:", requestId, "Accept:", accept)

      if (accept) {
        await acceptSwapRequestAction(request)
        console.log("[v0] Swap accepted successfully")
      } else {
        await rejectSwapRequestAction(request)
        console.log("[v0] Swap rejected successfully")
      }

      // Optimistic update
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: accept ? "ACCEPTED" : "REJECTED" } : r)),
      )

      // Fetch fresh data
      await fetchRequests()
      alert(accept ? "Swap accepted! Events have been exchanged." : "Swap rejected!")
    } catch (error) {
      console.error("Error handling response:", error)
      alert(error instanceof Error ? error.message : "Failed to process request")
      // Refetch on error to sync state
      await fetchRequests()
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "event-badge-green"
      case "REJECTED":
        return "event-badge-orange"
      default:
        return "event-badge-yellow"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Swap Requests</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Incoming Requests */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Incoming Requests</h2>
                {incomingRequests.length === 0 ? (
                  <p className="text-muted-foreground">No incoming requests</p>
                ) : (
                  <div className="grid gap-4">
                    {incomingRequests.map((request) => (
                      <Card key={request.id} className="p-6 bg-card border-border">
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h3 className="font-semibold text-white mb-2">Their Slot (Offered)</h3>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">
                                {request.requester_slot?.title || "N/A"}
                              </p>
                              <p className="text-sm text-gray-200">
                                {formatDateTimeLocal(request.requester_slot?.start_time || "")} -{" "}
                                {formatDateTimeLocal(request.requester_slot?.end_time || "")}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white mb-2">Your Slot (Requested)</h3>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">
                                {request.responder_slot?.title || "N/A"}
                              </p>
                              <p className="text-sm text-gray-200">
                                {formatDateTimeLocal(request.responder_slot?.start_time || "")} -{" "}
                                {formatDateTimeLocal(request.responder_slot?.end_time || "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Badge className={`${getStatusBadgeClass(request.status)} mb-4`}>
                            {request.status}
                          </Badge>

                          {request.status === "PENDING" && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleResponse(request.id, false)}
                                variant="outline"
                                className="flex-1"
                                disabled={processingId === request.id}
                              >
                                {processingId === request.id ? "Processing..." : "Reject"}
                              </Button>
                              <Button
                                onClick={() => handleResponse(request.id, true)}
                                className="flex-1 bg-primary hover:bg-primary/90"
                                disabled={processingId === request.id}
                              >
                                {processingId === request.id ? "Processing..." : "Accept"}
                              </Button>
                            </div>
                          )}

                          {request.status === "ACCEPTED" && (
                            <p className="text-center text-green-600 font-medium">Swap Accepted!</p>
                          )}

                          {request.status === "REJECTED" && (
                            <p className="text-center text-red-600 font-medium">Swap Rejected</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Outgoing Requests</h2>
                {outgoingRequests.length === 0 ? (
                  <p className="text-muted-foreground">No outgoing requests</p>
                ) : (
                  <div className="grid gap-4">
                    {outgoingRequests.map((request) => (
                      <Card key={request.id} className="p-6 bg-card border-border">
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h3 className="font-semibold text-white mb-2">Your Slot (Offered)</h3>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">
                                {request.requester_slot?.title || "N/A"}
                              </p>
                              <p className="text-sm text-gray-200">
                                {formatDateTimeLocal(request.requester_slot?.start_time || "")} -{" "}
                                {formatDateTimeLocal(request.requester_slot?.end_time || "")}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white mb-2">Their Slot (Requested)</h3>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">
                                {request.responder_slot?.title || "N/A"}
                              </p>
                              <p className="text-sm text-gray-200">
                                {formatDateTimeLocal(request.responder_slot?.start_time || "")} -{" "}
                                {formatDateTimeLocal(request.responder_slot?.end_time || "")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border pt-4">
                          <Badge className={getStatusBadgeClass(request.status)}>
                            {request.status === "PENDING" ? "Waiting for response..." : request.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
