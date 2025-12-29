import { startOfMonth, startOfDay, isAfter, isBefore, addDays, subDays, getDay } from 'date-fns'

/**
 * Gets the start of the current billing period
 * @param billingPeriodDay - Day of month when billing period starts (1-31)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Start date of the current billing period
 */
export function getBillingPeriodStart(
  billingPeriodDay: number,
  referenceDate: Date = new Date()
): Date {
  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth()
  const currentDay = referenceDate.getDate()

  // If billing day hasn't occurred this month, use last month
  if (currentDay < billingPeriodDay) {
    // Last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Handle edge case where billing day doesn't exist in the month (e.g., Feb 31)
    const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate()
    const actualBillingDay = Math.min(billingPeriodDay, daysInLastMonth)

    return startOfDay(new Date(lastMonthYear, lastMonth, actualBillingDay))
  } else {
    // This month
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const actualBillingDay = Math.min(billingPeriodDay, daysInCurrentMonth)

    return startOfDay(new Date(currentYear, currentMonth, actualBillingDay))
  }
}

/**
 * Gets the start of the current month (used when billing period day is not set)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Start date of the current month
 */
export function getMonthStart(referenceDate: Date = new Date()): Date {
  return startOfDay(startOfMonth(referenceDate))
}

/**
 * Checks if a date is a work day (Monday-Friday)
 * @param date - Date to check
 * @returns True if the date is a work day
 */
export function isWorkDay(date: Date): boolean {
  const dayOfWeek = getDay(date) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
}

/**
 * Gets the start of the current work week (Monday)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Start date of the current work week (Monday)
 */
export function getWorkWeekStart(referenceDate: Date = new Date()): Date {
  const dayOfWeek = getDay(referenceDate) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let daysToSubtract = 0
  if (dayOfWeek === 0) {
    // Sunday - go back to previous Monday (6 days)
    daysToSubtract = 6
  } else if (dayOfWeek === 6) {
    // Saturday - go back to previous Monday (5 days)
    daysToSubtract = 5
  } else {
    // Monday-Friday - go back to Monday (dayOfWeek - 1 days)
    daysToSubtract = dayOfWeek - 1
  }

  const monday = subDays(referenceDate, daysToSubtract)
  return startOfDay(monday)
}

/**
 * Gets the end of the current work week (Friday)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns End date of the current work week (Friday)
 */
export function getWorkWeekEnd(referenceDate: Date = new Date()): Date {
  const weekStart = getWorkWeekStart(referenceDate)
  return startOfDay(addDays(weekStart, 4)) // Friday is 4 days after Monday
}

/**
 * Gets the current work day (today if it's a work day, else most recent work day)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Current work day
 */
export function getCurrentWorkDay(referenceDate: Date = new Date()): Date {
  if (isWorkDay(referenceDate)) {
    return startOfDay(referenceDate)
  }

  // Find most recent work day
  let currentDate = subDays(referenceDate, 1)
  while (!isWorkDay(currentDate)) {
    currentDate = subDays(currentDate, 1)
  }

  return startOfDay(currentDate)
}

/**
 * Counts the number of work days between two dates (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of work days
 */
export function countWorkDays(startDate: Date, endDate: Date): number {
  let count = 0
  let current = startOfDay(startDate)
  const end = startOfDay(endDate)

  while (isBefore(current, end) || current.getTime() === end.getTime()) {
    if (isWorkDay(current)) {
      count++
    }
    current = addDays(current, 1)
  }

  return count
}

/**
 * Counts the number of work weeks remaining in the billing period
 * @param billingPeriodStart - Start of billing period
 * @param billingPeriodEnd - End of billing period (typically end of current month or next billing day)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Number of complete work weeks remaining
 */
export function countWorkWeeksRemaining(
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  referenceDate: Date = new Date()
): number {
  const currentWeekStart = getWorkWeekStart(referenceDate)

  // If current week start is before billing period start, use billing period start
  const effectiveStart = isAfter(currentWeekStart, billingPeriodStart)
    ? currentWeekStart
    : billingPeriodStart

  if (isBefore(billingPeriodEnd, effectiveStart)) {
    return 0
  }

  // Count complete work weeks (Monday-Friday) from effective start to billing period end
  let weekCount = 0
  let currentWeek = getWorkWeekStart(effectiveStart)

  while (isBefore(currentWeek, billingPeriodEnd) || currentWeek.getTime() === getWorkWeekStart(billingPeriodEnd).getTime()) {
    const weekEnd = getWorkWeekEnd(currentWeek)

    // Only count if the week has at least one day within the billing period
    if (isAfter(weekEnd, effectiveStart) || weekEnd.getTime() === effectiveStart.getTime()) {
      weekCount++
    }

    // Move to next week
    currentWeek = addDays(currentWeek, 7)

    // Safety check to prevent infinite loop
    if (weekCount > 100) break
  }

  return Math.max(0, weekCount)
}

/**
 * Counts the number of work days remaining in the current work week
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Number of work days remaining (including today if it's a work day)
 */
export function countWorkDaysRemainingInWeek(referenceDate: Date = new Date()): number {
  const weekEnd = getWorkWeekEnd(referenceDate)
  const currentWorkDay = getCurrentWorkDay(referenceDate)

  return countWorkDays(currentWorkDay, weekEnd)
}

/**
 * Gets the end of the billing period (day before next billing day, or end of month if no billing day set)
 * @param billingPeriodDay - Day of month when billing period starts (1-31)
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns End date of the current billing period
 */
export function getBillingPeriodEnd(
  billingPeriodDay: number,
  referenceDate: Date = new Date()
): Date {
  const periodStart = getBillingPeriodStart(billingPeriodDay, referenceDate)
  const nextPeriodStart = getBillingPeriodStart(billingPeriodDay, addDays(periodStart, 32))

  // End is one day before next period starts
  return startOfDay(subDays(nextPeriodStart, 1))
}

/**
 * Formats a date as ISO 8601 format (YYYY-MM-DD) for display
 */
export function formatDateForDisplay(date: Date): string {
  return date.toISOString().split('T')[0]
}

