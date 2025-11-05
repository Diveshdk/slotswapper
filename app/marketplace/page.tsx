"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface SwappableSlot {
  id: string
  title: string
  start_time: string
  end_time: string
  user_id: string
}

interface UserEvent extends SwappableSlot {
  status: string
}

export default function MarketplacePage() {
  const [swappableSlots, setSwappableSlots] = useState<SwappableSlot[]>([])
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: slots, error: slotsError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "SWAPPABLE")
        .neq("user_id", user.id)

      if (slotsError) throw slotsError

      const { data: mySlots, error: myError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "SWAPPABLE")

      if (myError) throw myError

      setSwappableSlots(slots || [])
      setUserEvents(mySlots || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSwapRequest = async (selectedUserSlotId: string) => {
    if (!selectedSlot) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: requestError } = await supabase.from("swap_requests").insert({
        requester_id: user.id,
        responder_id: selectedSlot.user_id,
        requester_slot_id: selectedUserSlotId,
        responder_slot_id: selectedSlot.id,
        status: "PENDING",
      })

      if (requestError) throw requestError

      await supabase.from("events").update({ status: "SWAP_PENDING" }).in("id", [selectedUserSlotId, selectedSlot.id])

      setIsDialogOpen(false)
      setSelectedSlot(null)
      fetchData()
      alert("Swap request sent!")
    } catch (error) {
      console.error("Error sending swap request:", error)
      alert(error instanceof Error ? error.message : "Failed to send swap request")
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Slots</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {swappableSlots.length} {swappableSlots.length === 1 ? "slot" : "slots"} available
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading available slots...</p>
            </div>
          ) : swappableSlots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No available slots to swap</p>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {swappableSlots.map((slot) => (
                <Card key={slot.id} className="p-4 md:p-5 bg-card border-border hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{slot.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {formatDateTime(slot.start_time)} - {formatDateTime(slot.end_time)}
                      </p>
                      <Badge className="mt-2 event-badge-blue">Available</Badge>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedSlot(slot)
                        setIsDialogOpen(true)
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
                      size="sm"
                    >
                      Request Swap
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select Your Slot to Swap</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose one of your swappable slots to offer in exchange
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {userEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No swappable slots available. Make a slot swappable from your calendar first.
              </p>
            ) : (
              userEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-muted/30"
                  onClick={() => handleSwapRequest(event.id)}
                >
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
