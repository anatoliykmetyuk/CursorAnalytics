import { describe, it, expect } from 'vitest'
import {
  getBillingPeriodStart,
  getMonthStart,
  isWorkDay,
  getWorkWeekStart,
  getWorkWeekEnd,
  getCurrentWorkDay,
  countWorkDays,
  countWorkWeeksRemaining,
  countWorkDaysRemainingInWeek,
  getBillingPeriodEnd,
} from '../../src/utils/dateCalculations'

describe('Date Calculations', () => {
  describe('getBillingPeriodStart', () => {
    it('should return start of current month if billing day has passed', () => {
      // Dec 20, billing day 15 -> should return Dec 15
      const date = new Date(2025, 11, 20) // Dec 20, 2025
      const result = getBillingPeriodStart(15, date)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(15)
    })

    it('should return start of previous month if billing day has not passed', () => {
      // Dec 10, billing day 15 -> should return Nov 15
      const date = new Date(2025, 11, 10) // Dec 10, 2025
      const result = getBillingPeriodStart(15, date)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(10) // November
      expect(result.getDate()).toBe(15)
    })

    it('should handle month boundary (January)', () => {
      // Jan 10, billing day 15 -> should return Dec 15 of previous year
      const date = new Date(2025, 0, 10) // Jan 10, 2025
      const result = getBillingPeriodStart(15, date)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(15)
    })

    it('should handle billing day that does not exist in month (e.g., Feb 31)', () => {
      // Feb 10, billing day 31 -> should return Jan 31
      const date = new Date(2025, 1, 10) // Feb 10, 2025
      const result = getBillingPeriodStart(31, date)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(31)
    })

    it('should handle billing day on the same day', () => {
      // Dec 15, billing day 15 -> should return Dec 15
      const date = new Date(2025, 11, 15) // Dec 15, 2025
      const result = getBillingPeriodStart(15, date)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(15)
    })
  })

  describe('getMonthStart', () => {
    it('should return start of current month', () => {
      const date = new Date(2025, 11, 20) // Dec 20, 2025
      const result = getMonthStart(date)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('isWorkDay', () => {
    it('should return true for Monday', () => {
      const monday = new Date(2025, 11, 29) // Dec 29, 2025 is a Monday
      expect(isWorkDay(monday)).toBe(true)
    })

    it('should return true for Friday', () => {
      // Dec 26, 2025 is a Friday
      const friday = new Date(2025, 11, 26)
      expect(isWorkDay(friday)).toBe(true)
    })

    it('should return false for Saturday', () => {
      const saturday = new Date(2025, 11, 28) // Dec 28, 2025 is a Saturday
      expect(isWorkDay(saturday)).toBe(false)
    })

    it('should return false for Sunday', () => {
      const sunday = new Date(2025, 11, 29) // Dec 29, 2025 is a Sunday (wait, let me check)
      // Actually, let me use a known Sunday
      const knownSunday = new Date(2025, 0, 5) // Jan 5, 2025 is a Sunday
      expect(isWorkDay(knownSunday)).toBe(false)
    })
  })

  describe('getWorkWeekStart', () => {
    it('should return Monday for a Monday', () => {
      // Dec 22, 2025 is a Monday
      const monday = new Date(2025, 11, 22)
      const result = getWorkWeekStart(monday)

      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(22)
    })

    it('should return previous Monday for a Friday', () => {
      // Dec 26, 2025 is a Friday
      const friday = new Date(2025, 11, 26)
      const result = getWorkWeekStart(friday)

      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(22) // Dec 22, 2025 (Monday of that week)
    })

    it('should return previous Monday for a Saturday', () => {
      const saturday = new Date(2025, 11, 28) // Dec 28, 2025 is a Saturday
      const result = getWorkWeekStart(saturday)

      expect(result.getDay()).toBe(1) // Monday
    })

    it('should return previous Monday for a Sunday', () => {
      const sunday = new Date(2025, 0, 5) // Jan 5, 2025 is a Sunday
      const result = getWorkWeekStart(sunday)

      expect(result.getDay()).toBe(1) // Monday
      // Should be Dec 30, 2024 (previous Monday)
    })
  })

  describe('getWorkWeekEnd', () => {
    it('should return Friday of the same week', () => {
      // Dec 22, 2025 is a Monday
      const monday = new Date(2025, 11, 22)
      const result = getWorkWeekEnd(monday)

      expect(result.getDay()).toBe(5) // Friday
      expect(result.getDate()).toBe(26) // Dec 26, 2025 (Friday of that week)
    })
  })

  describe('getCurrentWorkDay', () => {
    it('should return today if it is a work day', () => {
      // Dec 22, 2025 is a Monday
      const monday = new Date(2025, 11, 22)
      const result = getCurrentWorkDay(monday)

      expect(result.getDate()).toBe(22)
      expect(result.getMonth()).toBe(11)
    })

    it('should return previous work day if today is Saturday', () => {
      // Dec 27, 2025 is a Saturday
      const saturday = new Date(2025, 11, 27)
      const result = getCurrentWorkDay(saturday)

      expect(result.getDay()).toBe(5) // Friday
      expect(result.getDate()).toBe(26) // Dec 26, 2025 (previous Friday)
    })

    it('should return previous work day if today is Sunday', () => {
      const sunday = new Date(2025, 0, 5) // Jan 5, 2025 is a Sunday
      const result = getCurrentWorkDay(sunday)

      expect(result.getDay()).toBe(5) // Friday
    })
  })

  describe('countWorkDays', () => {
    it('should count work days in a week', () => {
      // Dec 22, 2025 is Monday, Dec 26, 2025 is Friday
      const start = new Date(2025, 11, 22)
      const end = new Date(2025, 11, 26)
      const count = countWorkDays(start, end)

      expect(count).toBe(5)
    })

    it('should count work days excluding weekends', () => {
      // Dec 22, 2025 is Monday, Dec 29, 2025 is Monday (next week)
      const start = new Date(2025, 11, 22)
      const end = new Date(2025, 11, 29)
      const count = countWorkDays(start, end)

      expect(count).toBe(6) // Mon-Fri of first week + Mon of second week
    })
  })

  describe('countWorkDaysRemainingInWeek', () => {
    it('should count remaining work days including today', () => {
      // Dec 22, 2025 is Monday
      const monday = new Date(2025, 11, 22)
      const count = countWorkDaysRemainingInWeek(monday)

      expect(count).toBe(5) // Mon-Fri
    })

    it('should count remaining work days from Friday', () => {
      // Dec 26, 2025 is Friday
      const friday = new Date(2025, 11, 26)
      const count = countWorkDaysRemainingInWeek(friday)

      expect(count).toBe(1) // Just Friday
    })
  })

  describe('getBillingPeriodEnd', () => {
    it('should return day before next billing period start', () => {
      const date = new Date(2025, 11, 20) // Dec 20, 2025
      const result = getBillingPeriodEnd(15, date)

      // Next period starts Jan 15, so end should be Jan 14
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(14)
    })
  })
})

