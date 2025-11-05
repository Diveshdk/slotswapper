"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'
import { Sidebar } from "@/components/sidebar"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { CalendarView } from "@/components/calendar-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING"
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true })

      if (error) throw error

      console.log("[v0] Fetched events:", data)
      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchEvents()

    // Subscribe to real-time changes in the events table
    const channel = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log("[v0] Real-time event update:", payload)
          // Refetch when there are changes to ensure consistency
          fetchEvents()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [fetchEvents, supabase])

  const handleToggleSwappable = async (event: Event) => {
    try {
      const newStatus = event.status === "BUSY" ? "SWAPPABLE" : "BUSY"
      console.log("[v0] Toggling event status:", event.id, "to", newStatus)

      const { error } = await supabase
        .from("events")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", event.id)

      if (error) throw error

      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: newStatus as any } : e)))
    } catch (error) {
      console.error("Error updating event:", error)
      alert("Failed to update event")
      fetchEvents()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SWAPPABLE":
        return "bg-green-100 text-green-800"
      case "SWAP_PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "SWAPPABLE":
        return "event-badge-green"
      case "SWAP_PENDING":
        return "event-badge-yellow"
      default:
        return "event-badge-blue"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {events.length} {events.length === 1 ? "event" : "events"} total
              </p>
            </div>
            <CreateEventDialog onEventCreated={fetchEvents} />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              <div className="lg:col-span-1">
                <CalendarView events={events} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
              </div>

              <div className="lg:col-span-2">
                <Card className="p-4 md:p-6 bg-card">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "All Events"}
                  </h2>

                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No events yet. Create one to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events
                        .filter((event) => {
                          if (!selectedDate) return true
                          const eventDate = new Date(event.start_time).toDateString()
                          const selectedDateStr = selectedDate.toDateString()
                          return eventDate === selectedDateStr
                        })
                        .map((event) => (
                          <Card
                            key={event.id}
                            className="p-3 md:p-4 bg-muted/50 border-border hover:bg-muted transition-colors"
                          >
                            <div className="flex flex-col md:flex-row justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                  {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
                                </p>
                                <div className="mt-2">
                                  <Badge className={getStatusBadgeColor(event.status)}>{event.status}</Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleToggleSwappable(event)}
                                variant={event.status === "SWAPPABLE" ? "default" : "outline"}
                                size="sm"
                                className="whitespace-nowrap"
                              >
                                {event.status === "SWAPPABLE" ? "Mark Busy" : "Swap"}
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
