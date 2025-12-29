import { useState, useEffect } from 'react'
import { getBillingPeriodDay, setBillingPeriodDay, getMonthlyCostLimit, setMonthlyCostLimit } from '../utils/localStorage'
import './Settings.css'

export function Settings() {
  const [billingPeriodDay, setBillingPeriodDayState] = useState<number>(1)
  const [monthlyCostLimit, setMonthlyCostLimitState] = useState<string>('')

  useEffect(() => {
    const day = getBillingPeriodDay()
    const limit = getMonthlyCostLimit()
    setBillingPeriodDayState(day)
    setMonthlyCostLimitState(limit !== null ? limit.toString() : '')
  }, [])

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
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setMonthlyCostLimit(numValue)
      }
    }
  }

  return (
    <div className="settings">
      <h2>Settings</h2>
      <div className="settings-grid">
        <div className="setting-group">
          <label htmlFor="billing-period-day">Billing Period Day of Month</label>
          <input
            id="billing-period-day"
            type="number"
            min="1"
            max="31"
            value={billingPeriodDay}
            onChange={handleBillingPeriodDayChange}
          />
          <p className="setting-hint">Day of month when your billing period starts (1-31)</p>
        </div>

        <div className="setting-group">
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
          <p className="setting-hint">Set a monthly spending limit (leave empty to remove limit)</p>
        </div>
      </div>
    </div>
  )
}

