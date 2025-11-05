"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { formatLocalDateTimeToISO } from "@/lib/utils/time-utils"

export function CreateEventDialog({ onEventCreated }: { onEventCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
  })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const startTimeISO = formatLocalDateTimeToISO(formData.startTime)
      const endTimeISO = formatLocalDateTimeToISO(formData.endTime)

      console.log("[v0] Creating event with times - Start:", startTimeISO, "End:", endTimeISO)

      const { error } = await supabase.from("events").insert({
        user_id: user.id,
        title: formData.title,
        start_time: startTimeISO,
        end_time: endTimeISO,
        status: "BUSY",
      })

      if (error) throw error

      setFormData({ title: "", startTime: "", endTime: "" })
      setOpen(false)
      onEventCreated()
      alert("Event created successfully!")
    } catch (error) {
      console.error("Error creating event:", error)
      alert(error instanceof Error ? error.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Add a new event to your calendar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateEvent}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., Team Meeting"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => {
                  console.log("[v0] Start time input:", e.target.value)
                  setFormData({ ...formData, startTime: e.target.value })
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => {
                  console.log("[v0] End time input:", e.target.value)
                  setFormData({ ...formData, endTime: e.target.value })
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
