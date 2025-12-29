import { useEffect, useState } from 'react'
import { Filters as FiltersType, CursorUsageRecord } from '../types'
import { getBillingPeriodStart, getMonthStart, formatDateForDisplay } from '../utils/dateCalculations'
import { getUniqueModels, getUniqueUsageTypes } from '../utils/budgetCalculations'
import { getBillingPeriodDay, setBillingPeriodDay, getMonthlyCostLimit, setMonthlyCostLimit } from '../utils/localStorage'
import './Filters.css'

interface FiltersProps {
  records: CursorUsageRecord[]
  filters: FiltersType
  onFiltersChange: (filters: FiltersType) => void
  onMonthlyLimitChange?: (limit: number | null) => void
}

export function Filters({ records, filters, onFiltersChange, onMonthlyLimitChange }: FiltersProps) {
  const models = getUniqueModels(records)
  const usageTypes = getUniqueUsageTypes(records)
  const [billingPeriodDay, setBillingPeriodDayState] = useState<number>(1)
  const [monthlyCostLimit, setMonthlyCostLimitState] = useState<string>('')

  useEffect(() => {
    const day = getBillingPeriodDay()
    const limit = getMonthlyCostLimit()
    setBillingPeriodDayState(day)
    setMonthlyCostLimitState(limit !== null ? limit.toString() : '')
  }, [])

  const currentBillingPeriodDay = billingPeriodDay

  // Set default date range on mount or when records change
  useEffect(() => {
    if (records.length === 0) return

    // Only set defaults if dates are not already set
    if (!filters.dateRange.start || !filters.dateRange.end) {
      const start = currentBillingPeriodDay
        ? getBillingPeriodStart(currentBillingPeriodDay)
        : getMonthStart()
      const end = new Date()

      onFiltersChange({
        ...filters,
        dateRange: {
          start,
          end,
        },
      })
    }
  }, [records.length, currentBillingPeriodDay]) // Only depend on records length and billing day

  const handleBillingPeriodDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= 31) {
      setBillingPeriodDayState(value)
      setBillingPeriodDay(value)
    }
  }

  const handleMonthlyCostLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setMonthlyCostLimitState(value)

    if (value === '') {
      setMonthlyCostLimit(null)
      onMonthlyLimitChange?.(null)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setMonthlyCostLimit(numValue)
        onMonthlyLimitChange?.(numValue)
      }
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value ? new Date(e.target.value) : null
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start,
      },
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value ? new Date(e.target.value) : null
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end,
      },
    })
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value || null
    onFiltersChange({
      ...filters,
      model,
    })
  }

  const handleUsageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const usageType = e.target.value || null
    onFiltersChange({
      ...filters,
      usageType,
    })
  }

  return (
    <div className="filters">
      <h2>Filters</h2>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={filters.dateRange.start ? formatDateForDisplay(filters.dateRange.start) : ''}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            value={filters.dateRange.end ? formatDateForDisplay(filters.dateRange.end) : ''}
            onChange={handleEndDateChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="model">Model</label>
          <select id="model" value={filters.model || ''} onChange={handleModelChange}>
            <option value="">All Models</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="usage-type">Usage Type</label>
          <select id="usage-type" value={filters.usageType || ''} onChange={handleUsageTypeChange}>
            <option value="">All Types</option>
            {usageTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="billing-period-day">Billing Period Day</label>
          <input
            id="billing-period-day"
            type="number"
            min="1"
            max="31"
            value={billingPeriodDay}
            onChange={handleBillingPeriodDayChange}
          />
          <p className="filter-hint">Day of month when billing period starts (1-31)</p>
        </div>

        <div className="filter-group">
          <label htmlFor="monthly-cost-limit">Monthly Cost Limit ($)</label>
          <input
            id="monthly-cost-limit"
            type="number"
            min="0"
            step="0.01"
            value={monthlyCostLimit}
            onChange={handleMonthlyCostLimitChange}
            placeholder="Enter limit or leave empty"
          />
          <p className="filter-hint">Set a monthly spending limit (leave empty to remove limit)</p>
        </div>
      </div>
    </div>
  )
}

