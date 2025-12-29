import { CursorUsageRecord } from '../types'
import {
  getBillingPeriodStart,
  getBillingPeriodEnd,
  getWorkWeekStart,
  getWorkWeekEnd,
  getCurrentWorkDay,
  countWorkDaysRemainingInWeek,
  countWorkWeeksRemaining,
} from './dateCalculations'
import { isAfter, isBefore, startOfDay } from 'date-fns'

/**
 * Filters out "Errored, No Charge" and "Aborted, Not Charged" entries
 */
export function excludeErroredNoCharge(records: CursorUsageRecord[]): CursorUsageRecord[] {
  return records.filter(
    record => record.kind !== 'Errored, No Charge' && record.kind !== 'Aborted, Not Charged'
  )
}

/**
 * Calculates total cost for records within a date range
 */
export function calculateTotalCost(records: CursorUsageRecord[]): number {
  return records.reduce((sum, record) => sum + record.cost, 0)
}

/**
 * Calculates On-Demand cost for records
 */
export function calculateOnDemandCost(records: CursorUsageRecord[]): number {
  const onDemandRecords = records.filter(record => record.kind === 'On-Demand')
  return calculateTotalCost(onDemandRecords)
}

/**
 * Filters records by date range
 */
export function filterByDateRange(
  records: CursorUsageRecord[],
  startDate: Date | null,
  endDate: Date | null
): CursorUsageRecord[] {
  if (!startDate && !endDate) {
    return records
  }

  return records.filter(record => {
    const recordDate = startOfDay(record.date)

    if (startDate && isBefore(recordDate, startOfDay(startDate))) {
      return false
    }

    if (endDate && isAfter(recordDate, startOfDay(endDate))) {
      return false
    }

    return true
  })
}

/**
 * Filters records by model
 */
export function filterByModel(
  records: CursorUsageRecord[],
  model: string | null
): CursorUsageRecord[] {
  if (!model) {
    return records
  }

  return records.filter(record => record.model === model)
}

/**
 * Filters records by usage type (kind)
 */
export function filterByUsageType(
  records: CursorUsageRecord[],
  usageType: string | null
): CursorUsageRecord[] {
  if (!usageType) {
    return records
  }

  return records.filter(record => record.kind === usageType)
}

/**
 * Gets all unique models from records
 */
export function getUniqueModels(records: CursorUsageRecord[]): string[] {
  const models = new Set(records.map(r => r.model))
  return Array.from(models).sort()
}

/**
 * Gets all unique usage types (kinds) from records
 */
export function getUniqueUsageTypes(records: CursorUsageRecord[]): string[] {
  const kinds = new Set(records.map(r => r.kind))
  return Array.from(kinds).sort()
}

/**
 * Calculates current billing period usage (unfiltered)
 * Excludes "Errored, No Charge" entries from progress bar calculations
 */
export function calculateBillingPeriodUsage(
  records: CursorUsageRecord[],
  billingPeriodDay: number
): number {
  const periodStart = getBillingPeriodStart(billingPeriodDay)
  const periodEnd = getBillingPeriodEnd(billingPeriodDay)

  const periodRecords = filterByDateRange(records, periodStart, periodEnd)
  const filteredRecords = excludeErroredNoCharge(periodRecords)
  return calculateTotalCost(filteredRecords)
}

/**
 * Calculates current work week usage (unfiltered)
 * Excludes "Errored, No Charge" entries from progress bar calculations
 */
export function calculateWorkWeekUsage(records: CursorUsageRecord[]): number {
  const weekStart = getWorkWeekStart()
  const weekEnd = getWorkWeekEnd()

  const weekRecords = filterByDateRange(records, weekStart, weekEnd)
  const filteredRecords = excludeErroredNoCharge(weekRecords)
  return calculateTotalCost(filteredRecords)
}

/**
 * Calculates current work day usage (unfiltered)
 * Excludes "Errored, No Charge" entries from progress bar calculations
 */
export function calculateWorkDayUsage(records: CursorUsageRecord[]): number {
  const workDay = getCurrentWorkDay()
  const dayStart = startOfDay(workDay)
  const dayEnd = startOfDay(workDay)

  const dayRecords = filterByDateRange(records, dayStart, dayEnd)
  const filteredRecords = excludeErroredNoCharge(dayRecords)
  return calculateTotalCost(filteredRecords)
}

/**
 * Calculates weekly budget limit
 */
export function calculateWeeklyLimit(
  monthlyLimit: number,
  billingPeriodUsage: number,
  weeksRemaining: number
): number {
  if (weeksRemaining <= 0) {
    return 0
  }

  const remainingBudget = monthlyLimit - billingPeriodUsage
  return Math.max(0, remainingBudget / weeksRemaining)
}

/**
 * Calculates daily budget limit
 */
export function calculateDailyLimit(
  weeklyLimit: number,
  workWeekUsage: number,
  workDaysRemaining: number
): number {
  if (workDaysRemaining <= 0) {
    return 0
  }

  const remainingBudget = weeklyLimit - workWeekUsage
  return Math.max(0, remainingBudget / workDaysRemaining)
}

/**
 * Calculates all budget metrics for progress bars
 */
export interface BudgetMetrics {
  monthlyUsage: number
  monthlyLimit: number | null
  weeklyUsage: number
  weeklyLimit: number | null
  dailyUsage: number
  dailyLimit: number | null
}

export function calculateBudgetMetrics(
  records: CursorUsageRecord[],
  billingPeriodDay: number,
  monthlyLimit: number | null
): BudgetMetrics {
  const monthlyUsage = calculateBillingPeriodUsage(records, billingPeriodDay)
  const weeklyUsage = calculateWorkWeekUsage(records)
  const dailyUsage = calculateWorkDayUsage(records)

  let weeklyLimit: number | null = null
  let dailyLimit: number | null = null

  if (monthlyLimit !== null) {
    const periodStart = getBillingPeriodStart(billingPeriodDay)
    const periodEnd = getBillingPeriodEnd(billingPeriodDay)
    const weeksRemaining = countWorkWeeksRemaining(periodStart, periodEnd)

    weeklyLimit = calculateWeeklyLimit(monthlyLimit, monthlyUsage, weeksRemaining)

    const workDaysRemaining = countWorkDaysRemainingInWeek()
    dailyLimit = calculateDailyLimit(weeklyLimit, weeklyUsage, workDaysRemaining)
  }

  return {
    monthlyUsage,
    monthlyLimit,
    weeklyUsage,
    weeklyLimit,
    dailyUsage,
    dailyLimit,
  }
}

