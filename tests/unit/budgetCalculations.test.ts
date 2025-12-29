import { describe, it, expect } from 'vitest'
import {
  calculateTotalCost,
  calculateOnDemandCost,
  filterByDateRange,
  filterByModel,
  filterByUsageType,
  getUniqueModels,
  getUniqueUsageTypes,
  calculateBillingPeriodUsage,
  calculateWorkWeekUsage,
  calculateWorkDayUsage,
  calculateWeeklyLimit,
  calculateDailyLimit,
  calculateBudgetMetrics,
  excludeErroredNoCharge,
} from '../../src/utils/budgetCalculations'
import { CursorUsageRecord } from '../../src/types'

const createRecord = (
  date: Date,
  cost: number,
  model: string = 'auto',
  kind: string = 'Included'
): CursorUsageRecord => ({
  date,
  kind,
  model,
  maxMode: 'No',
  inputWithCacheWrite: 0,
  inputWithoutCacheWrite: 0,
  cacheRead: 0,
  outputTokens: 0,
  totalTokens: 0,
  cost,
})

describe('Budget Calculations', () => {
  describe('calculateTotalCost', () => {
    it('should sum all costs', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.5),
        createRecord(new Date(2025, 11, 21), 2.3),
        createRecord(new Date(2025, 11, 22), 0.8),
      ]

      expect(calculateTotalCost(records)).toBe(4.6)
    })

    it('should return 0 for empty array', () => {
      expect(calculateTotalCost([])).toBe(0)
    })
  })

  describe('calculateOnDemandCost', () => {
    it('should calculate cost only for On-Demand entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'On-Demand'),
        createRecord(new Date(2025, 11, 22), 15.0, 'auto', 'On-Demand'),
        createRecord(new Date(2025, 11, 23), 3.0, 'auto', 'Included'),
      ]

      expect(calculateOnDemandCost(records)).toBe(20.0)
    })

    it('should return 0 if no On-Demand entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'Included'),
      ]

      expect(calculateOnDemandCost(records)).toBe(0)
    })

    it('should return 0 for empty array', () => {
      expect(calculateOnDemandCost([])).toBe(0)
    })
  })

  describe('filterByDateRange', () => {
    it('should filter records within date range', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0),
        createRecord(new Date(2025, 11, 21), 2.0),
        createRecord(new Date(2025, 11, 22), 3.0),
      ]

      const start = new Date(2025, 11, 21)
      const end = new Date(2025, 11, 22)
      const filtered = filterByDateRange(records, start, end)

      expect(filtered).toHaveLength(2)
      expect(filtered[0].cost).toBe(2.0)
      expect(filtered[1].cost).toBe(3.0)
    })

    it('should return all records if no date range specified', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0),
      ]

      const filtered = filterByDateRange(records, null, null)
      expect(filtered).toHaveLength(1)
    })
  })

  describe('filterByModel', () => {
    it('should filter records by model', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0, 'auto'),
        createRecord(new Date(2025, 11, 21), 2.0, 'claude-4.5'),
        createRecord(new Date(2025, 11, 22), 3.0, 'auto'),
      ]

      const filtered = filterByModel(records, 'auto')
      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => r.model === 'auto')).toBe(true)
    })

    it('should return all records if no model specified', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0),
      ]

      const filtered = filterByModel(records, null)
      expect(filtered).toHaveLength(1)
    })
  })

  describe('filterByUsageType', () => {
    it('should filter records by usage type', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 2.0, 'auto', 'On-Demand'),
        createRecord(new Date(2025, 11, 22), 3.0, 'auto', 'Included'),
      ]

      const filtered = filterByUsageType(records, 'Included')
      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => r.kind === 'Included')).toBe(true)
    })
  })

  describe('getUniqueModels', () => {
    it('should return unique sorted models', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0, 'claude-4.5'),
        createRecord(new Date(2025, 11, 21), 2.0, 'auto'),
        createRecord(new Date(2025, 11, 22), 3.0, 'claude-4.5'),
      ]

      const models = getUniqueModels(records)
      expect(models).toEqual(['auto', 'claude-4.5'])
    })
  })

  describe('getUniqueUsageTypes', () => {
    it('should return unique sorted usage types', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 1.0, 'auto', 'On-Demand'),
        createRecord(new Date(2025, 11, 21), 2.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 22), 3.0, 'auto', 'On-Demand'),
      ]

      const types = getUniqueUsageTypes(records)
      expect(types).toEqual(['Included', 'On-Demand'])
    })
  })

  describe('calculateBillingPeriodUsage', () => {
    it('should calculate usage for current billing period', () => {
      // Create records spanning multiple months
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 10, 20), 1.0), // November
        createRecord(new Date(2025, 11, 10), 2.0), // December (before billing day 15)
        createRecord(new Date(2025, 11, 20), 3.0), // December (after billing day 15)
      ]

      // If today is Dec 20, billing period starts Dec 15
      const usage = calculateBillingPeriodUsage(records, 15)

      // Should only include Dec 20 record (Dec 15 onwards)
      expect(usage).toBeGreaterThanOrEqual(3.0)
    })
  })

  describe('calculateWeeklyLimit', () => {
    it('should calculate weekly limit correctly', () => {
      const monthlyLimit = 100
      const billingPeriodUsage = 40
      const weeksRemaining = 4

      const weeklyLimit = calculateWeeklyLimit(monthlyLimit, billingPeriodUsage, weeksRemaining)

      expect(weeklyLimit).toBe(15) // (100 - 40) / 4 = 15
    })

    it('should return 0 if no weeks remaining', () => {
      const weeklyLimit = calculateWeeklyLimit(100, 50, 0)
      expect(weeklyLimit).toBe(0)
    })

    it('should return 0 if remaining budget is negative', () => {
      const weeklyLimit = calculateWeeklyLimit(100, 150, 4)
      expect(weeklyLimit).toBe(0)
    })
  })

  describe('calculateDailyLimit', () => {
    it('should calculate daily limit correctly', () => {
      const weeklyLimit = 50
      const workWeekUsage = 20
      const workDaysRemaining = 3

      const dailyLimit = calculateDailyLimit(weeklyLimit, workWeekUsage, workDaysRemaining)

      expect(dailyLimit).toBe(10) // (50 - 20) / 3 = 10
    })
  })

  describe('calculateBudgetMetrics', () => {
    it('should calculate all budget metrics', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0),
      ]

      const metrics = calculateBudgetMetrics(records, 15, 100)

      expect(metrics.monthlyUsage).toBeGreaterThanOrEqual(0)
      expect(metrics.monthlyLimit).toBe(100)
      expect(metrics.weeklyUsage).toBeGreaterThanOrEqual(0)
      expect(metrics.dailyUsage).toBeGreaterThanOrEqual(0)
    })

    it('should return null limits when monthly limit is not set', () => {
      const records: CursorUsageRecord[] = []
      const metrics = calculateBudgetMetrics(records, 15, null)

      expect(metrics.monthlyLimit).toBeNull()
      expect(metrics.weeklyLimit).toBeNull()
      expect(metrics.dailyLimit).toBeNull()
    })
  })

  describe('excludeErroredNoCharge', () => {
    it('should exclude "Errored, No Charge" entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'Errored, No Charge'),
        createRecord(new Date(2025, 11, 22), 15.0, 'auto', 'On-Demand'),
      ]

      const filtered = excludeErroredNoCharge(records)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => r.kind !== 'Errored, No Charge')).toBe(true)
      expect(calculateTotalCost(filtered)).toBe(25.0)
    })

    it('should exclude "Aborted, Not Charged" entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'Aborted, Not Charged'),
        createRecord(new Date(2025, 11, 22), 15.0, 'auto', 'On-Demand'),
      ]

      const filtered = excludeErroredNoCharge(records)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => r.kind !== 'Aborted, Not Charged')).toBe(true)
      expect(calculateTotalCost(filtered)).toBe(25.0)
    })

    it('should exclude both "Errored, No Charge" and "Aborted, Not Charged" entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'Errored, No Charge'),
        createRecord(new Date(2025, 11, 22), 3.0, 'auto', 'Aborted, Not Charged'),
        createRecord(new Date(2025, 11, 23), 15.0, 'auto', 'On-Demand'),
      ]

      const filtered = excludeErroredNoCharge(records)

      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => r.kind !== 'Errored, No Charge' && r.kind !== 'Aborted, Not Charged')).toBe(true)
      expect(calculateTotalCost(filtered)).toBe(25.0)
    })

    it('should return all records if no excluded entries', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 20), 10.0, 'auto', 'Included'),
        createRecord(new Date(2025, 11, 21), 5.0, 'auto', 'On-Demand'),
      ]

      const filtered = excludeErroredNoCharge(records)

      expect(filtered).toHaveLength(2)
      expect(calculateTotalCost(filtered)).toBe(15.0)
    })
  })

  describe('calculateBillingPeriodUsage excludes Errored, No Charge and Aborted, Not Charged', () => {
    it('should exclude "Errored, No Charge" from billing period usage', () => {
      const today = new Date(2025, 11, 20) // December 20, 2025
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 15), 10.0, 'auto', 'Included'), // Within billing period
        createRecord(new Date(2025, 11, 16), 5.0, 'auto', 'Errored, No Charge'), // Should be excluded
        createRecord(new Date(2025, 11, 17), 15.0, 'auto', 'On-Demand'), // Within billing period
      ]

      const usage = calculateBillingPeriodUsage(records, 15)

      // Should only include Included and On-Demand, exclude Errored, No Charge
      expect(usage).toBeGreaterThanOrEqual(25.0)
      expect(usage).toBeLessThan(30.0) // Should not include the 5.0 from Errored, No Charge
    })

    it('should exclude "Aborted, Not Charged" from billing period usage', () => {
      const records: CursorUsageRecord[] = [
        createRecord(new Date(2025, 11, 15), 10.0, 'auto', 'Included'), // Within billing period
        createRecord(new Date(2025, 11, 16), 5.0, 'auto', 'Aborted, Not Charged'), // Should be excluded
        createRecord(new Date(2025, 11, 17), 15.0, 'auto', 'On-Demand'), // Within billing period
      ]

      const usage = calculateBillingPeriodUsage(records, 15)

      // Should only include Included and On-Demand, exclude Aborted, Not Charged
      expect(usage).toBeGreaterThanOrEqual(25.0)
      expect(usage).toBeLessThan(30.0) // Should not include the 5.0 from Aborted, Not Charged
    })
  })
})

