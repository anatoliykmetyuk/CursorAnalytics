import { useMemo } from 'react'
import { CursorUsageRecord } from '../types'
import { calculateBudgetMetrics } from '../utils/budgetCalculations'
import { getBillingPeriodDay, getMonthlyCostLimit } from '../utils/localStorage'
import './ProgressBars.css'

interface ProgressBarsProps {
  records: CursorUsageRecord[]
}

export function ProgressBars({ records }: ProgressBarsProps) {
  const billingPeriodDay = getBillingPeriodDay()
  const monthlyLimit = getMonthlyCostLimit()

  const metrics = useMemo(() => {
    return calculateBudgetMetrics(records, billingPeriodDay, monthlyLimit)
  }, [records, billingPeriodDay, monthlyLimit])

  if (monthlyLimit === null) {
    return null
  }

  const monthlyPercentage = metrics.monthlyLimit
    ? Math.min(100, (metrics.monthlyUsage / metrics.monthlyLimit) * 100)
    : 0

  const weeklyPercentage = metrics.weeklyLimit
    ? Math.min(100, (metrics.weeklyUsage / metrics.weeklyLimit) * 100)
    : 0

  const dailyPercentage = metrics.dailyLimit
    ? Math.min(100, (metrics.dailyUsage / metrics.dailyLimit) * 100)
    : 0

  return (
    <div className="progress-bars">
      <h2>Budget Progress</h2>
      <div className="progress-bars-grid">
        <div className="progress-bar-group">
          <div className="progress-bar-header">
            <span className="progress-bar-label">Monthly Usage</span>
            <span className="progress-bar-values">
              ${metrics.monthlyUsage.toFixed(2)} / ${metrics.monthlyLimit?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${monthlyPercentage}%` }}
            />
          </div>
          <div className="progress-bar-percentage">
            {monthlyPercentage.toFixed(1)}%
          </div>
        </div>

        {metrics.weeklyLimit !== null && (
          <div className="progress-bar-group">
            <div className="progress-bar-header">
              <span className="progress-bar-label">Work Week Usage</span>
              <span className="progress-bar-values">
                ${metrics.weeklyUsage.toFixed(2)} / ${metrics.weeklyLimit.toFixed(2)}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${weeklyPercentage}%` }}
              />
            </div>
            <div className="progress-bar-percentage">
              {weeklyPercentage.toFixed(1)}%
            </div>
          </div>
        )}

        {metrics.dailyLimit !== null && (
          <div className="progress-bar-group">
            <div className="progress-bar-header">
              <span className="progress-bar-label">Work Day Usage</span>
              <span className="progress-bar-values">
                ${metrics.dailyUsage.toFixed(2)} / ${metrics.dailyLimit.toFixed(2)}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
            <div className="progress-bar-percentage">
              {dailyPercentage.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

