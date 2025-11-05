import { createClient } from "@/lib/supabase/client"

export interface NotificationEvent {
  type: "swap_request" | "swap_accepted" | "swap_rejected"
  data: any
  timestamp: string
}

export class NotificationService {
  private supabase = createClient()
  private listeners: ((event: NotificationEvent) => void)[] = []

  subscribe(callback: (event: NotificationEvent) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private notify(event: NotificationEvent) {
    this.listeners.forEach((listener) => listener(event))
  }

  setupSwapRequestListener() {
    const channel = this.supabase
      .channel("swap_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "swap_requests",
        },
        (payload) => {
          this.notify({
            type: "swap_request",
            data: payload.new,
            timestamp: new Date().toISOString(),
          })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "swap_requests",
        },
        (payload) => {
          const status = payload.new.status
          const notificationType =
            status === "ACCEPTED" ? "swap_accepted" : status === "REJECTED" ? "swap_rejected" : "swap_request"

          this.notify({
            type: notificationType as any,
            data: payload.new,
            timestamp: new Date().toISOString(),
          })
        },
      )
      .subscribe()

    return channel
  }

  unsubscribeAll() {
    this.supabase.removeAllChannels()
  }
}

export const notificationService = new NotificationService()
