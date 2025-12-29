const BILLING_PERIOD_DAY_KEY = 'cursor-analytics-billing-period-day'
const MONTHLY_COST_LIMIT_KEY = 'cursor-analytics-monthly-cost-limit'

export function getBillingPeriodDay(): number {
  const stored = localStorage.getItem(BILLING_PERIOD_DAY_KEY)
  if (stored === null) {
    return 1 // Default value
  }
  const day = parseInt(stored, 10)
  return isNaN(day) || day < 1 || day > 31 ? 1 : day
}

export function setBillingPeriodDay(day: number): void {
  if (day >= 1 && day <= 31) {
    localStorage.setItem(BILLING_PERIOD_DAY_KEY, day.toString())
  }
}

export function getMonthlyCostLimit(): number | null {
  const stored = localStorage.getItem(MONTHLY_COST_LIMIT_KEY)
  if (stored === null || stored === '') {
    return null
  }
  const limit = parseFloat(stored)
  return isNaN(limit) || limit < 0 ? null : limit
}

export function setMonthlyCostLimit(limit: number | null): void {
  if (limit === null || limit === undefined || limit === 0) {
    localStorage.removeItem(MONTHLY_COST_LIMIT_KEY)
  } else if (limit > 0) {
    localStorage.setItem(MONTHLY_COST_LIMIT_KEY, limit.toString())
  }
}

