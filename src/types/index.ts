export interface CursorUsageRecord {
  date: Date
  kind: string
  model: string
  maxMode: string
  inputWithCacheWrite: number
  inputWithoutCacheWrite: number
  cacheRead: number
  outputTokens: number
  totalTokens: number
  cost: number
}

export interface ChartDataPoint {
  date: string
  dailyCost: number
  cumulativeCost: number
}

export interface Filters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  model: string | null
  usageType: string | null
}

export interface Settings {
  billingPeriodDay: number
  monthlyCostLimit: number | null
}

