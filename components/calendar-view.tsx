"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTimeLocal } from "@/lib/utils/time-utils"

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  status: string
}

interface CalendarViewProps {
  events: Event[]
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export function CalendarView({ events, selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const eventsForDate = (day: number) => {
    if (!day) return []
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
    return events.filter((event) => event.start_time.startsWith(dateStr))
  }

  const days = []
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
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
    <Card className="bg-card border-border p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} className="p-2 bg-transparent">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="p-2 bg-transparent">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((day, index) => {
          const dayEvents = eventsForDate(day)
          const isCurrentDay = isToday(day)
          const isSelectedDay = isSelected(day)

          return (
            <div
              key={index}
              onClick={() => day && onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`min-h-16 md:min-h-24 p-2 border rounded-lg cursor-pointer transition-colors text-xs md:text-sm ${
                !day
                  ? "bg-transparent border-transparent"
                  : isSelectedDay
                    ? "bg-primary/20 border-primary"
                    : isCurrentDay
                      ? "bg-primary/10 border-primary/50"
                      : "bg-muted/30 border-border hover:bg-muted/50"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-xs md:text-sm font-semibold ${isCurrentDay ? "text-primary" : "text-foreground"}`}
                  >
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 1).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${getStatusBadgeColor(event.status)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 1 && (
                        <div className="text-xs px-1.5 py-0.5 text-muted-foreground">+{dayEvents.length - 1}</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day details - responsive */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {eventsForDate(selectedDate.getDate()).length === 0 ? (
            <p className="text-xs md:text-sm text-muted-foreground">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {eventsForDate(selectedDate.getDate()).map((event) => (
                <Card key={event.id} className="p-2 md:p-3 bg-muted/30 border-border">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-foreground text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTimeLocal(event.start_time)} - {formatDateTimeLocal(event.end_time)}
                    </p>
                    <Badge className={getStatusBadgeColor(event.status)}>{event.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
