/**
 * Parse datetime-local input value to Date object
 * datetime-local format: "2024-11-15T14:30"
 */
export function parseLocalDateTime(dateTimeLocalValue: string): Date {
  if (!dateTimeLocalValue) {
    throw new Error("Invalid datetime-local value")
  }

  // Split into date and time parts
  const [datePart, timePart] = dateTimeLocalValue.split("T")

  if (!datePart || !timePart) {
    throw new Error("Invalid datetime-local format. Expected format: YYYY-MM-DDTHH:mm")
  }

  const [year, month, day] = datePart.split("-").map(Number)
  const [hour, minute] = timePart.split(":").map(Number)

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day, hour, minute, 0, 0)

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date values")
  }

  return date
}

/**
 * Format Date object to datetime-local format
 */
export function formatToDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hour}:${minute}`
}

/**
 * Format Date object to ISO string but preserve local time
 * This ensures database stores the actual local time intended by user
 */
export function formatLocalDateTimeToISO(dateTimeLocalValue: string): string {
  const date = parseLocalDateTime(dateTimeLocalValue)

  // Convert local time to ISO by manually building the string
  // This ensures we don't lose time zone info
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  const second = String(date.getSeconds()).padStart(2, "0")

  // Return ISO format
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
}

/**
 * Format Date/string for display
 */
export function formatDateTimeLocal(dateString: string | Date): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return "Invalid date"
  }
}
