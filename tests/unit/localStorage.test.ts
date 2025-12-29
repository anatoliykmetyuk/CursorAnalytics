import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveCSVData,
  loadCSVData,
  deleteCSVData,
  getBillingPeriodDay,
  setBillingPeriodDay,
  getMonthlyCostLimit,
  setMonthlyCostLimit,
} from '../../src/utils/localStorage'
import { CursorUsageRecord } from '../../src/types'

describe('localStorage utilities', () => {

  describe('CSV Data', () => {
    const mockRecords: CursorUsageRecord[] = [
      {
        date: new Date('2025-12-20T10:00:00Z'),
        kind: 'Included',
        model: 'auto',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 1.5,
      },
      {
        date: new Date('2025-12-21T10:00:00Z'),
        kind: 'On-Demand',
        model: 'claude-4.5',
        maxMode: 'No',
        inputWithCacheWrite: 0,
        inputWithoutCacheWrite: 0,
        cacheRead: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 2.3,
      },
    ]

    it('should save and load CSV data', () => {
      saveCSVData(mockRecords)
      const loaded = loadCSVData()

      expect(loaded).not.toBeNull()
      expect(loaded?.length).toBe(2)
      expect(loaded?.[0].cost).toBe(1.5)
      expect(loaded?.[0].date).toBeInstanceOf(Date)
      expect(loaded?.[1].cost).toBe(2.3)
    })

    it('should return null when no data is saved', () => {
      const loaded = loadCSVData()
      expect(loaded).toBeNull()
    })

    it('should delete CSV data', () => {
      saveCSVData(mockRecords)
      expect(loadCSVData()).not.toBeNull()

      deleteCSVData()
      expect(loadCSVData()).toBeNull()
    })

    it('should preserve Date objects correctly', () => {
      saveCSVData(mockRecords)
      const loaded = loadCSVData()

      expect(loaded?.[0].date).toBeInstanceOf(Date)
      expect(loaded?.[0].date.getTime()).toBe(mockRecords[0].date.getTime())
    })
  })

  describe('Billing Period Day', () => {
    it('should return default value when not set', () => {
      expect(getBillingPeriodDay()).toBe(1)
    })

    it('should save and retrieve billing period day', () => {
      setBillingPeriodDay(15)
      expect(getBillingPeriodDay()).toBe(15)
    })

    it('should clamp invalid values', () => {
      setBillingPeriodDay(0)
      expect(getBillingPeriodDay()).toBe(1)

      setBillingPeriodDay(32)
      expect(getBillingPeriodDay()).toBe(1)
    })
  })

  describe('Monthly Cost Limit', () => {
    it('should return null when not set', () => {
      expect(getMonthlyCostLimit()).toBeNull()
    })

    it('should save and retrieve monthly cost limit', () => {
      setMonthlyCostLimit(100)
      expect(getMonthlyCostLimit()).toBe(100)
    })

    it('should remove limit when set to null', () => {
      setMonthlyCostLimit(100)
      setMonthlyCostLimit(null)
      expect(getMonthlyCostLimit()).toBeNull()
    })
  })
})

