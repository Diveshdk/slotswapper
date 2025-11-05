import { formatDateTimeLocal, parseLocalDateTime } from "@/lib/utils/time-utils"

describe("Time Utilities", () => {
  describe("parseLocalDateTime", () => {
    it("should parse datetime-local input correctly", () => {
      const input = "2024-11-15T14:30"
      const result = parseLocalDateTime(input)

      expect(result).toBeDefined()
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it("should handle edge cases", () => {
      const input = "2024-01-01T00:00"
      const result = parseLocalDateTime(input)

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe("formatDateTimeLocal", () => {
    it("should format date correctly for display", () => {
      const date = new Date("2024-11-15T14:30:00")
      const result = formatDateTimeLocal(date)

      expect(result).toContain("2024")
      expect(result).toContain("14:30")
    })
  })
})
